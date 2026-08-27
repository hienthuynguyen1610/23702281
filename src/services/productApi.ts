import { PRICE_MULTIPLIER } from '@constants/student';

export type CategoryId = 'all' | 'food' | 'drink' | 'study';

export const fetchProducts = async () => {
  const res = await fetch('https://fakestoreapi.com/products?limit=8');
  if (!res.ok) throw new Error('Không thể tải dữ liệu');
  const data = await res.json();

  return data.map((item: any) => {
    let category: CategoryId = 'food';
    if (item.category.includes('clothing')) category = 'study';
    else if (item.category.includes('jewel')) category = 'drink';

    return {
      id: item.id,
      title: item.title,
      price: Math.round(item.price * PRICE_MULTIPLIER),
      image: item.image,
      category,
      description: item.description,
    };
  });
};