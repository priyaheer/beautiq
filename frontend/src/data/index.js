export const brands = ['Maison Aurelle','Velour Atelier','Noor & Co','Seraphine','Kori Skin','Dune Botanica','Atelier Rosé','Lumen Lab','Veda Ritual','Oro Parfums','Hale & Haven','Mira Cosmetics','Solene','Opaline','Ember & Oak','Petal Theory','Nuvé','Calla Studio','Ivory Lane','Saffron House','Bloom Theory','Alba Skin']
const T = {
 makeup:[['Velvet Matte Lipstick','Lips',899],['Skin Veil Foundation','Face',1499],['Soft Focus Concealer','Face',749],['Cloud Blush','Cheeks',899],['Luminous Highlighter','Face',999],['Volume Lash Mascara','Eyes',699],['Eyeshadow Quad','Eyes',1299],['Precision Brow Pencil','Eyes',499],['Satin Lip Gloss','Lips',649],['Silk Setting Powder','Face',849],['Tinted Lip Balm','Lips',449],['Liquid Eyeliner','Eyes',549],['Bronzing Drops','Face',1199],['Lip Liner Duo','Lips',599],['Blur Primer','Face',1099],['Cream Contour Stick','Face',949]],
 skincare:[['Vitamin C Brightening Serum','Serums',1799],['Hyaluronic Water Cream','Moisturisers',1299],['Gentle Gel Cleanser','Cleansers',749],['Niacinamide 10% Treatment','Serums',999],['Mineral SPF 50 Fluid','Sun Care',899],['Retinol Night Concentrate','Treatments',2199],['Rose Hydrating Mist','Toners',649],['Peptide Eye Cream','Eye Care',1599],['Clay Purifying Mask','Masks',1099],['AHA Glow Exfoliant','Treatments',1399],['Ceramide Barrier Balm','Moisturisers',1199],['Squalane Face Oil','Oils',1499],['Cica Calming Toner','Toners',849],['Overnight Sleeping Mask','Masks',1699],['Micellar Cleansing Water','Cleansers',599],['Bakuchiol Renewal Serum','Serums',1899]],
 haircare:[['Repair Bond Shampoo','Shampoo',899],['Silk Hydration Conditioner','Conditioner',899],['Argan Nourish Hair Oil','Treatments',1099],['Scalp Detox Scrub','Scalp Care',999],['Curl Defining Cream','Styling',849],['Heat Shield Spray','Styling',749],['Deep Repair Hair Mask','Masks',1299],['Rosemary Growth Serum','Scalp Care',1199],['Purple Tone Shampoo','Shampoo',799],['Leave-In Detangler','Conditioner',699],['Texture Sea Salt Spray','Styling',649],['Shine Gloss Mist','Treatments',799],['Keratin Smooth Treatment','Treatments',1499],['Volumising Root Lift','Styling',749]],
 fragrance:[['Oud Noir Eau de Parfum','Eau de Parfum',3499],['Neroli Bloom Eau de Toilette','Eau de Toilette',2499],['Amber Musk Extrait','Extrait',4299],['Sandalwood Veil Parfum','Eau de Parfum',3299],['White Tea Cologne','Cologne',1899],['Fig & Vetiver Eau de Parfum','Eau de Parfum',2999],['Jasmine Dusk Body Mist','Body Mist',1199],['Saffron Rose Attar','Attar',2199],['Vanilla Smoke Perfume Oil','Perfume Oil',1699],['Cedar Rain Eau de Toilette','Eau de Toilette',2299],['Iris Powder Eau de Parfum','Eau de Parfum',3799],['Citrus Garden Cologne','Cologne',1599],['Tuberose Night Parfum','Eau de Parfum',3599],['Discovery Set of Five','Gift Sets',1999]]
}
const skin=['Dry','Oily','Combination','Sensitive','Normal'], conc=['Dullness','Acne','Ageing','Hydration','Redness','Frizz','Damage']
const shadeSet=[['Rosewood','#A8665A'],['Nude Silk','#D2A68F'],['Berry','#7A2E44'],['Terracotta','#B5593F'],['Sand','#E1C3A5'],['Mocha','#6F4A3A']]
const ing={makeup:['Jojoba Esters','Vitamin E','Mica','Squalane'],skincare:['Niacinamide','Hyaluronic Acid','Ceramides','Panthenol','Squalane'],haircare:['Argan Oil','Keratin','Biotin','Rosemary Extract'],fragrance:['Alcohol Denat.','Parfum','Linalool','Limonene']}
let i=0
export const products=Object.entries(T).flatMap(([category,list])=>list.map(([name,subcategory,price])=>{
 const n=i++, p=price+(n%4)*50, disc=n%3===0?0:[10,15,20,25][n%4], hue=14+(n*17)%34
 return { id:n+1, brand:brands[(n*7+3)%brands.length], name, category, subcategory, price:Math.round(p*(1-disc/100)), originalPrice:p, discount:disc,
  rating:+(3.9+((n*37)%12)/10).toFixed(1), reviews:40+(n*173)%1800, hue,
  shades:category==='makeup'?shadeSet.slice(n%3,n%3+4).map(([name,hex])=>({name,hex})):[],
  size:category==='fragrance'?['30 ml','50 ml','100 ml']:['30 ml','50 ml'],
  ingredients:ing[category], benefits:['Visible results in 2 weeks','Dermatologically tested','Cruelty-free'],
  skinTypes:[skin[n%5],skin[(n+2)%5]], concerns:[conc[n%7],conc[(n+3)%7]],
  description:`${name} by ${brands[(n*7+3)%brands.length]} — a refined formula designed for everyday ritual and lasting results.`,
  bestseller:n%5===0, newArrival:n%4===1, trending:n%3===2, stock:n%11===0?0:5+(n*3)%40 }
}))
export const coupons={BEAUTIQ10:0.1,WELCOME15:0.15}

// Hair-type suitability (used by Beauty Finder + product details). Patterns: Straight/Wavy/Curly/Coily · Textures: Fine/Thick
const HT = { 'Repair Bond Shampoo': ['Thick', 'Wavy', 'Curly'], 'Silk Hydration Conditioner': ['Straight', 'Wavy', 'Thick'], 'Argan Nourish Hair Oil': ['Thick', 'Curly', 'Coily'],
  'Scalp Detox Scrub': ['Straight', 'Fine', 'Wavy'], 'Curl Defining Cream': ['Curly', 'Coily', 'Wavy'], 'Heat Shield Spray': ['Straight', 'Wavy', 'Thick'], 'Deep Repair Hair Mask': ['Thick', 'Curly', 'Coily'],
  'Rosemary Growth Serum': ['Fine', 'Straight', 'Wavy'], 'Purple Tone Shampoo': ['Straight', 'Wavy', 'Fine'], 'Leave-In Detangler': ['Curly', 'Coily', 'Fine'], 'Texture Sea Salt Spray': ['Wavy', 'Fine', 'Straight'],
  'Shine Gloss Mist': ['Straight', 'Thick', 'Wavy'], 'Keratin Smooth Treatment': ['Thick', 'Wavy', 'Curly'], 'Volumising Root Lift': ['Fine', 'Straight'] }
products.forEach(p => { p.hairTypes = p.category === 'haircare' ? (HT[p.name] || ['Straight', 'Wavy']) : [] })
export const hairTypes = ['Straight', 'Wavy', 'Curly', 'Coily', 'Fine', 'Thick']
