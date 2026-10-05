// match = product.subcategory values covered by each storefront subcategory
export const categories = [
  { id: 'cat-makeup', slug: 'makeup', name: 'Makeup', hue: 14, tagline: 'Face, eyes, lips and cheeks — finished with intent.', subcategories: [
    { name: 'Face', match: ['Face'] }, { name: 'Eyes', match: ['Eyes'] }, { name: 'Lips', match: ['Lips'] }, { name: 'Cheeks', match: ['Cheeks'] }] },
  { id: 'cat-skincare', slug: 'skincare', name: 'Skincare', hue: 28, tagline: 'Considered formulas for skin that looks like itself, only better.', subcategories: [
    { name: 'Cleanser', match: ['Cleansers'] }, { name: 'Moisturizer', match: ['Moisturisers'] }, { name: 'Serum', match: ['Serums'] }, { name: 'Sunscreen', match: ['Sun Care'] },
    { name: 'Masks', match: ['Masks'] }, { name: 'Toners & Mists', match: ['Toners'] }, { name: 'Treatments', match: ['Treatments', 'Oils', 'Eye Care'] }] },
  { id: 'cat-haircare', slug: 'haircare', name: 'Haircare', hue: 40, tagline: 'Scalp-first rituals for every texture.', subcategories: [
    { name: 'Shampoo', match: ['Shampoo'] }, { name: 'Conditioner', match: ['Conditioner'] }, { name: 'Hair Mask', match: ['Masks'] }, { name: 'Styling', match: ['Styling'] },
    { name: 'Scalp Care', match: ['Scalp Care'] }, { name: 'Treatments', match: ['Treatments'] }] },
  { id: 'cat-fragrance', slug: 'fragrance', name: 'Fragrance', hue: 20, tagline: 'Slow-burning florals, woods and ambers.', subcategories: [
    { name: 'Perfume', match: ['Extrait', 'Perfume Oil', 'Attar'] }, { name: 'Eau de Parfum', match: ['Eau de Parfum'] }, { name: 'Eau de Toilette', match: ['Eau de Toilette', 'Cologne'] },
    { name: 'Body Mist', match: ['Body Mist'] }, { name: 'Gift Sets', match: ['Gift Sets'] }] }]
