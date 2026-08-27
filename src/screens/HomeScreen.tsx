import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator, Modal, Alert, SafeAreaView } from 'react-native';
import { STUDENT, BANNER_IMAGE_ID, FLASH_SECONDS, VARIANT, examStamp } from '@constants/student';
import { fetchProducts, CategoryId } from '@services/productApi';
import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import ShopInput from '@components/ui/ShopInput';
import ShopButton from '@components/ui/ShopButton';
import Typography from '@components/ui/Typography';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: CategoryId;
  description: string;
}

type QuantityAction = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };
const quantityReducer = (state: number, action: QuantityAction): number => {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state > 1 ? state - 1 : 1;
    case 'RESET': return 1;
    default: return state;
  }
};

const HomeScreen = () => {
  const { isDark, toggleTheme, themeColors } = useTheme();
  const { formattedTime, isExpired } = useCountdown(FLASH_SECONDS);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, dispatchQuantity] = useReducer(quantityReducer, 1);

  const loadData = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(false);

    fetchProducts()
      .then((data) => {
        if (alive) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  const categories = useMemo(() => {
    const raw: { id: CategoryId; label: string }[] = [
      { id: 'all', label: 'Tất cả' },
      { id: 'food', label: 'Đồ ăn' },
      { id: 'drink', label: 'Nước' },
      { id: 'study', label: 'Học tập' },
    ];
    return VARIANT.chipsReversed ? [...raw].reverse() : raw;
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchText, selectedCategory]);

  const handleOpenModal = useCallback((item: Product) => {
    setSelectedProduct(item);
    dispatchQuantity({ type: 'RESET' });
  }, []);

  const handleCloseModal = () => {
    setSelectedProduct(null);
    dispatchQuantity({ type: 'RESET' });
  };

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;
    Alert.alert(
      `CampusMart · ${STUDENT.mssv}`,
      `${STUDENT.hoTen} (#${examStamp()}) đã ghi nhận: ${selectedProduct.title} × ${quantity}. Nhận tại quầy KTX.`
    );
    handleCloseModal();
  };

  const renderWatermark = () => (
    <View style={styles.watermark}>
      <Typography style={styles.watermarkText}>
        TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{examStamp()}
      </Typography>
    </View>
  );

  const dynamicBg = isDark ? themeColors.dark.background : themeColors.background;
  const dynamicCardBg = isDark ? themeColors.dark.surface : themeColors.surface;
  const dynamicText = isDark ? themeColors.dark.text : themeColors.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicBg }]}>
      {VARIANT.watermarkAtTop && renderWatermark()}

      <View style={styles.header}>
        <View style={styles.rowBetween}>
          <Typography variant="bold" style={[styles.brand, { color: themeColors.primary }]}>
            CAMPUSMART
          </Typography>
          <Pressable style={styles.themeBtn} onPress={toggleTheme}>
            <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>
              {isDark ? 'Sáng' : 'Tối'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.rowBetween}>
          <Typography style={{ color: dynamicText }}>Tiện lợi KTX</Typography>
          <Typography variant="bold" style={{ color: themeColors.secondary }}>
            Flash {formattedTime}
          </Typography>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <ShopInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={`Tìm món, nước, đồ dùng — ${STUDENT.mssv}`}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Typography style={{ marginTop: 8, color: dynamicText }}>Đang tải món...</Typography>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Typography variant="bold" style={{ color: themeColors.error, marginBottom: 12 }}>
            {STUDENT.mssv} — Không tải được dữ liệu món.
          </Typography>
          <ShopButton title="Thử lại" onPress={loadData} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => `${STUDENT.mssv}-${item.id}`}
          ListHeaderComponent={
            <>
              <View style={styles.bannerContainer}>
                <Image
                  source={{ uri: `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/320` }}
                  style={styles.banner}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>Đặt nhanh · Nhận tại quầy</Text>
                  <Text style={styles.bannerSub}>Cửa hàng tiện lợi ký túc xá 24/7</Text>
                </View>
              </View>

              <View style={styles.chipRow}>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.chip,
                        active ? { backgroundColor: themeColors.primary } : { borderWidth: 1, borderColor: themeColors.primary },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text style={{ color: active ? '#FFF' : themeColors.primary, fontWeight: 'bold' }}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: dynamicCardBg }]}>
              <Image source={{ uri: item.image }} style={styles.cardImg} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Typography variant="bold" numberOfLines={1} style={{ color: dynamicText }}>
                  {item.title}
                </Typography>
                <Typography variant="bold" style={{ color: themeColors.primary, marginVertical: 2 }}>
                  {item.price.toLocaleString('vi-VN')} đ
                </Typography>
                <Typography style={{ color: themeColors.textLight, fontSize: 12 }}>
                  {item.category === 'food' ? 'Đồ ăn' : item.category === 'drink' ? 'Nước' : 'Học tập'}
                </Typography>
              </View>
              <ShopButton title="Đặt" onPress={() => handleOpenModal(item)} />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Typography style={{ color: dynamicText }}>Không có món phù hợp</Typography>
            </View>
          }
        />
      )}

      {!VARIANT.watermarkAtTop && renderWatermark()}

      <Modal
        visible={!!selectedProduct}
        transparent={true}
        animationType={VARIANT.modalAnimation}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Typography style={styles.modalWatermark}>
              TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{examStamp()}
            </Typography>

            {selectedProduct && (
              <>
                <Image source={{ uri: selectedProduct.image }} style={styles.modalImg} resizeMode="contain" />
                <Typography variant="bold" style={{ fontSize: 16, textAlign: 'center' }}>
                  {selectedProduct.title}
                </Typography>
                <Typography variant="bold" style={{ color: themeColors.primary, fontSize: 18, marginVertical: 4 }}>
                  {selectedProduct.price.toLocaleString('vi-VN')} đ
                </Typography>
                <Typography style={{ color: themeColors.textLight, fontSize: 12 }}>
                  Danh mục: {selectedProduct.category}
                </Typography>
                <Typography numberOfLines={2} style={styles.modalDesc}>
                  {selectedProduct.description}
                </Typography>

                <View style={styles.qtyRow}>
                  <Pressable style={styles.qtyBtn} onPress={() => dispatchQuantity({ type: 'DECREMENT' })}>
                    <Text style={styles.qtyText}>−</Text>
                  </Pressable>
                  <Typography variant="bold" style={{ marginHorizontal: 16, fontSize: 18 }}>
                    {quantity}
                  </Typography>
                  <Pressable style={styles.qtyBtn} onPress={() => dispatchQuantity({ type: 'INCREMENT' })}>
                    <Text style={styles.qtyText}>+</Text>
                  </Pressable>
                </View>

                <ShopButton
                  title={isExpired ? 'Hết giờ flash-sale' : 'Xác nhận đặt'}
                  onPress={handleConfirmOrder}
                  disabled={isExpired}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <ShopButton title="Đóng" variant="outline" onPress={handleCloseModal} style={{ width: '100%' }} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  watermark: { paddingVertical: 6, alignItems: 'center', backgroundColor: '#CCFBF1' },
  watermarkText: { fontSize: 12, fontWeight: 'bold', color: '#0F766E' },
  header: { marginVertical: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 22 },
  themeBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: '#0F766E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bannerContainer: { height: 130, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  banner: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 118, 110, 0.75)', justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: '#FFF', fontSize: 12 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  card: { flexDirection: 'row', padding: 10, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  cardImg: { width: 50, height: 50, borderRadius: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center' },
  modalWatermark: { fontSize: 11, color: '#0F766E', marginBottom: 8, fontWeight: 'bold' },
  modalImg: { width: 100, height: 100, marginBottom: 8 },
  modalDesc: { fontSize: 12, color: '#5F7A77', textAlign: 'center', marginVertical: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;