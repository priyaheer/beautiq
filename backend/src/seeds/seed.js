require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Brand = require('../models/Brand')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const Article = require('../models/Article')
const Review = require('../models/Review')
const makeSlug = require('../utils/slugify')

const BRANDS = [
  { name: 'Maison Aurelle', desc: 'French-inspired luxury skincare and cosmetics with a heritage of artisanal formulation.' },
  { name: 'Velour Atelier', desc: 'Ultra-pigmented colour cosmetics crafted for professional and everyday use.' },
  { name: 'Noor & Co', desc: 'Clean beauty rooted in Ayurvedic ingredients and modern science.' },
  { name: 'Seraphine', desc: 'Botanical skincare that bridges ritual with efficacy.' },
  { name: 'Kori Skin', desc: 'Korean-inspired multi-step routines for every skin type.' },
  { name: 'Dune Botanica', desc: 'Desert-plant extracts for resilient, radiant skin.' },
  { name: 'Atelier Rosé', desc: 'Rose-led formulations for sensitive and reactive complexions.' },
  { name: 'Lumen Lab', desc: 'Science-first serums and treatments for targeted skin concerns.' },
  { name: 'Veda Ritual', desc: 'Ayurvedic haircare rooted in centuries of botanical wisdom.' },
  { name: 'Oro Parfums', desc: 'Niche Indian fragrances blending oud, saffron and jasmine.' },
  { name: 'Hale & Haven', desc: 'Reef-safe mineral sun care for active, outdoor lifestyles.' },
  { name: 'Mira Cosmetics', desc: 'Inclusive cosmetics with 60+ shades across every product.' },
  { name: 'Solene', desc: 'Minimalist French pharmacy-style skincare for daily rituals.' },
  { name: 'Opaline', desc: 'Gemstone-infused beauty products with a luxurious sensory experience.' },
  { name: 'Ember & Oak', desc: 'Warm, woody fragrances and body rituals inspired by forest bathing.' },
  { name: 'Petal Theory', desc: 'Floral extracts and petal actives for luminous, healthy skin.' },
  { name: 'Nuvé', desc: 'Sustainable packaging with powerful, planet-positive formulas.' },
  { name: 'Calla Studio', desc: 'Clean, vegan colour cosmetics with a cult following.' },
  { name: 'Ivory Lane', desc: 'Everyday essentials elevated with thoughtful fragrance and packaging.' },
  { name: 'Saffron House', desc: 'Saffron-forward skincare and haircare inspired by Persian beauty.' },
  { name: 'Bloom Theory', desc: 'Active botanicals and proven peptides for age-defying skincare.' },
  { name: 'Alba Skin', desc: 'Ultra-light, breathable formulas designed for tropical Indian climates.' }
]

const CATEGORIES = [
  { name: 'Makeup', slug: 'makeup', tagline: 'Face, eyes, lips and cheeks — finished with intent.', hue: 14, subcategories: [{ name: 'Face', match: ['Face'] }, { name: 'Eyes', match: ['Eyes'] }, { name: 'Lips', match: ['Lips'] }, { name: 'Cheeks', match: ['Cheeks'] }] },
  { name: 'Skincare', slug: 'skincare', tagline: 'Considered formulas for skin that looks like itself, only better.', hue: 28, subcategories: [{ name: 'Cleanser', match: ['Cleansers'] }, { name: 'Moisturizer', match: ['Moisturisers'] }, { name: 'Serum', match: ['Serums'] }, { name: 'Sunscreen', match: ['Sun Care'] }, { name: 'Masks', match: ['Masks'] }, { name: 'Toners & Mists', match: ['Toners'] }, { name: 'Treatments', match: ['Treatments', 'Oils', 'Eye Care'] }] },
  { name: 'Haircare', slug: 'haircare', tagline: 'Scalp-first rituals for every texture.', hue: 40, subcategories: [{ name: 'Shampoo', match: ['Shampoo'] }, { name: 'Conditioner', match: ['Conditioner'] }, { name: 'Hair Mask', match: ['Masks'] }, { name: 'Styling', match: ['Styling'] }, { name: 'Scalp Care', match: ['Scalp Care'] }, { name: 'Treatments', match: ['Treatments'] }] },
  { name: 'Fragrance', slug: 'fragrance', tagline: 'Slow-burning florals, woods and ambers.', hue: 20, subcategories: [{ name: 'Perfume', match: ['Extrait', 'Perfume Oil', 'Attar'] }, { name: 'Eau de Parfum', match: ['Eau de Parfum'] }, { name: 'Eau de Toilette', match: ['Eau de Toilette', 'Cologne'] }, { name: 'Body Mist', match: ['Body Mist'] }, { name: 'Gift Sets', match: ['Gift Sets'] }] }
]

const PRODUCTS = [
  // Makeup
  { name: 'Velvet Matte Lipstick', brand: 'Velour Atelier', cat: 'makeup', sub: 'Lips', price: 899, disc: 0, skin: ['Normal','Dry'], conc: ['Hydration'], hue: 14, hair: [], ing: ['Vitamin E','Jojoba Esters','Carnauba Wax'], ben: ['12-hour wear','Non-drying formula','Buildable colour'], desc: 'A weightless matte lipstick with a velvet-soft finish. Vitamin E keeps lips comfortable while the pigment stays put through the day.', shades: [{name:'Rosewood',hex:'#A8665A'},{name:'Berry',hex:'#7A2E44'},{name:'Nude Silk',hex:'#D2A68F'},{name:'Terracotta',hex:'#B5593F'}], bs: true, na: false, tr: false },
  { name: 'Skin Veil Foundation', brand: 'Mira Cosmetics', cat: 'makeup', sub: 'Face', price: 1499, disc: 10, skin: ['Normal','Combination'], conc: ['Dullness','Hydration'], hue: 18, hair: [], ing: ['Hyaluronic Acid','Mica','Squalane','SPF15'], ben: ['60+ shades','Skincare ingredients','Natural finish'], desc: 'A weightless foundation that blurs, hydrates and unifies. Hyaluronic Acid locks in moisture for 16 hours.', shades: [{name:'Warm Beige',hex:'#D4A88A'},{name:'Cool Ivory',hex:'#E8D4BE'},{name:'Golden Tan',hex:'#B07D5A'},{name:'Deep Espresso',hex:'#5A3B24'}], bs: true, na: false, tr: true },
  { name: 'Soft Focus Concealer', brand: 'Maison Aurelle', cat: 'makeup', sub: 'Face', price: 749, disc: 0, skin: ['Dry','Sensitive'], conc: ['Redness','Hydration'], hue: 16, hair: [], ing: ['Peptides','Vitamin E','Zinc'], ben: ['Full coverage','Blurs fine lines','Long-wearing'], desc: 'A creamy concealer that covers and corrects without caking. Peptides support the skin through the day.', shades: [{name:'Fair',hex:'#F0DDD0'},{name:'Light',hex:'#E4C9B5'},{name:'Medium',hex:'#C9A080'},{name:'Tan',hex:'#A0714F'}], bs: false, na: true, tr: false },
  { name: 'Cloud Blush', brand: 'Calla Studio', cat: 'makeup', sub: 'Cheeks', price: 899, disc: 15, skin: ['Normal','Oily'], conc: ['Dullness'], hue: 10, hair: [], ing: ['Mica','Squalane','Vitamin E'], ben: ['Buildable colour','Silky texture','Lasts 8 hours'], desc: 'A powder blush with a cloud-like texture that melts into skin. Layer it for a barely-there flush or a statement cheek.', shades: [{name:'Rose',hex:'#D4788A'},{name:'Peach Coral',hex:'#E8956A'},{name:'Berry Glow',hex:'#8A4060'}], bs: true, na: false, tr: true },
  // Skincare
  { name: 'Vitamin C Brightening Serum', brand: 'Lumen Lab', cat: 'skincare', sub: 'Serums', price: 1799, disc: 10, skin: ['Dull','Normal','Combination'], conc: ['Dullness','Ageing'], hue: 34, hair: [], ing: ['Ascorbic Acid 15%','Vitamin E','Ferulic Acid','Niacinamide'], ben: ['Visible brightness in 2 weeks','Antioxidant protection','Evens skin tone'], desc: 'A stabilised 15% vitamin C serum with ferulic acid for enhanced efficacy. Skin looks visibly brighter and more even with consistent use.', shades: [], bs: true, na: false, tr: true },
  { name: 'Hyaluronic Water Cream', brand: 'Kori Skin', cat: 'skincare', sub: 'Moisturisers', price: 1299, disc: 0, skin: ['Dry','Normal','Oily'], conc: ['Hydration'], hue: 30, hair: [], ing: ['Hyaluronic Acid','Ceramides','Centella Asiatica','Glycerin'], ben: ['72-hour hydration','Lightweight formula','Barrier repair'], desc: 'A gel-cream moisturiser that delivers deep, lasting hydration without heaviness. Hyaluronic acid at three molecular weights targets every layer of the skin.', shades: [], bs: true, na: false, tr: false },
  { name: 'Gentle Gel Cleanser', brand: 'Solene', cat: 'skincare', sub: 'Cleansers', price: 749, disc: 0, skin: ['All','Sensitive'], conc: ['Redness','Acne'], hue: 26, hair: [], ing: ['Gluconolactone','Aloe Vera','Panthenol','Glycerin'], ben: ['pH-balanced','Non-stripping','Dermatologist approved'], desc: 'A pH-balanced gel cleanser that removes impurities without compromising the skin barrier. Leaves skin soft and comfortable, never tight.', shades: [], bs: false, na: true, tr: false },
  { name: 'Niacinamide 10% Treatment', brand: 'Lumen Lab', cat: 'skincare', sub: 'Serums', price: 999, disc: 0, skin: ['Oily','Combination','Acne-prone'], conc: ['Acne','Redness','Dullness'], hue: 32, hair: [], ing: ['Niacinamide 10%','Zinc PCA','Hyaluronic Acid'], ben: ['Reduces pores','Controls oil','Evens skin tone'], desc: 'A 10% niacinamide serum with zinc PCA to control sebum and minimise pores. Visible results from week two.', shades: [], bs: true, na: false, tr: false },
  { name: 'Mineral SPF 50 Fluid', brand: 'Hale & Haven', cat: 'skincare', sub: 'Sun Care', price: 899, disc: 0, skin: ['All','Sensitive'], conc: ['Ageing','Redness'], hue: 28, hair: [], ing: ['Zinc Oxide 22%','Titanium Dioxide','Aloe Vera'], ben: ['Broad spectrum UVA/UVB','Reef-safe','No white cast'], desc: 'A non-nano mineral sunscreen that offers broad-spectrum protection without the white cast. Water-resistant and reef-safe.', shades: [], bs: false, na: true, tr: true },
  { name: 'Retinol Night Concentrate', brand: 'Bloom Theory', cat: 'skincare', sub: 'Treatments', price: 2199, disc: 20, skin: ['Normal','Combination'], conc: ['Ageing','Dullness'], hue: 36, hair: [], ing: ['Retinol 0.5%','Bakuchiol','Peptides','Ceramides'], ben: ['Boosts cell turnover','Reduces fine lines','Firming effect'], desc: 'A 0.5% retinol concentrate buffered with bakuchiol for a gentler nightly treatment. Skin looks firmer and more refined within four weeks.', shades: [], bs: true, na: false, tr: true },
  // Haircare
  { name: 'Repair Bond Shampoo', brand: 'Veda Ritual', cat: 'haircare', sub: 'Shampoo', price: 899, disc: 0, skin: ['Normal'], conc: ['Damage'], hue: 40, hair: ['Thick','Wavy','Curly'], ing: ['Keratin','Bhringraj','Argan Oil','Panthenol'], ben: ['Rebuilds hair bonds','Reduces breakage','Adds shine'], desc: 'A bond-repairing shampoo that strengthens from root to tip. Bhringraj extract promotes scalp health while keratin seals the cuticle.', shades: [], bs: true, na: false, tr: false },
  { name: 'Argan Nourish Hair Oil', brand: 'Veda Ritual', cat: 'haircare', sub: 'Treatments', price: 1099, disc: 0, skin: ['Normal'], conc: ['Damage','Frizz'], hue: 38, hair: ['Thick','Curly','Coily'], ing: ['Argan Oil','Jojoba Oil','Vitamin E','Rosemary Extract'], ben: ['Controls frizz','Adds luminous shine','Heat protection to 230°C'], desc: 'A non-greasy argan oil blend that tames frizz, adds mirror shine and protects against heat up to 230°C. One drop transforms dry ends.', shades: [], bs: true, na: false, tr: true },
  { name: 'Curl Defining Cream', brand: 'Saffron House', cat: 'haircare', sub: 'Styling', price: 849, disc: 15, skin: ['Normal'], conc: ['Frizz'], hue: 44, hair: ['Curly','Coily','Wavy'], ing: ['Shea Butter','Aloe Vera','Flaxseed Extract','Glycerin'], ben: ['Defines curl pattern','Anti-frizz 48 hours','Lightweight hold'], desc: 'A leave-in curl cream that defines, nourishes and holds without crunch. Flaxseed extract enhances curl pattern while shea butter seals in moisture.', shades: [], bs: false, na: true, tr: true },
  { name: 'Rosemary Growth Serum', brand: 'Veda Ritual', cat: 'haircare', sub: 'Scalp Care', price: 1199, disc: 0, skin: ['Normal'], conc: ['Damage'], hue: 42, hair: ['Fine','Straight','Wavy'], ing: ['Rosemary Oil','Caffeine','Biotin','Peptides'], ben: ['Stimulates hair follicles','Reduces hair fall','Thickens fine hair'], desc: 'A scalp serum with clinical-grade rosemary oil and caffeine to energise follicles and visibly reduce hair fall from week four.', shades: [], bs: true, na: false, tr: true },
  { name: 'Deep Repair Hair Mask', brand: 'Veda Ritual', cat: 'haircare', sub: 'Masks', price: 1299, disc: 10, skin: ['Normal'], conc: ['Damage','Frizz'], hue: 40, hair: ['Thick','Curly','Coily'], ing: ['Keratin','Shea Butter','Argan Oil','Biotin'], ben: ['Intensive repair in 3 minutes','Reduces split ends','Brilliant shine'], desc: 'An intensive three-minute mask that repairs damage, controls frizz and delivers professional-level shine. Best used weekly on towel-dried hair.', shades: [], bs: false, na: false, tr: false },
  // Fragrance
  { name: 'Oud Noir Eau de Parfum', brand: 'Oro Parfums', cat: 'fragrance', sub: 'Eau de Parfum', price: 3499, disc: 0, skin: ['Normal'], conc: ['Hydration'], hue: 8, hair: [], ing: ['Alcohol Denat.','Parfum','Oud','Rose','Benzyl Benzoate'], ben: ['8-10 hour longevity','Moderate-to-strong projection','Sillage-approved'], desc: 'A bold, intimate oud with an opening of spiced rose and a base of aged wood and amber. For those who want to be remembered.', shades: [], bs: true, na: false, tr: true, sizes: ['30 ml','50 ml','100 ml'] },
  { name: 'Neroli Bloom Eau de Toilette', brand: 'Oro Parfums', cat: 'fragrance', sub: 'Eau de Toilette', price: 2499, disc: 10, skin: ['Normal'], conc: ['Hydration'], hue: 24, hair: [], ing: ['Alcohol Denat.','Parfum','Neroli','Bergamot','Musk'], ben: ['6-8 hour wear','Light sillage','Office-friendly'], desc: 'A luminous neroli with bergamot top notes that dry down to a soft, skin-close musk. Perfect for year-round wear.', shades: [], bs: false, na: true, tr: false, sizes: ['30 ml','50 ml','100 ml'] },
  { name: 'Amber Musk Extrait', brand: 'Ember & Oak', cat: 'fragrance', sub: 'Extrait', price: 4299, disc: 0, skin: ['Normal'], conc: ['Hydration'], hue: 12, hair: [], ing: ['Alcohol Denat.','Parfum','Ambergris','Labdanum','Vetiver'], ben: ['12+ hour longevity','Skin-fusing warmth','Intimate sillage'], desc: 'A concentrated extrait that melts into skin, radiating warm amber and earthy vetiver for hours. A deeply personal scent for evening wear.', shades: [], bs: true, na: false, tr: false, sizes: ['15 ml','30 ml'] },
  { name: 'Jasmine Dusk Body Mist', brand: 'Oro Parfums', cat: 'fragrance', sub: 'Body Mist', price: 1199, disc: 20, skin: ['All'], conc: ['Hydration'], hue: 20, hair: [], ing: ['Aqua','Alcohol','Jasmine Absolute','Sandalwood'], ben: ['Lightweight and fresh','Layerable','4-6 hour wear'], desc: 'A jasmine-forward body mist with a warm sandalwood dry-down. Spray generously after a shower and layer over your favourite EDP.', shades: [], bs: false, na: true, tr: true, sizes: ['100 ml','200 ml'] },
  { name: 'Sandalwood Veil Parfum', brand: 'Ember & Oak', cat: 'fragrance', sub: 'Eau de Parfum', price: 3299, disc: 0, skin: ['Normal'], conc: ['Hydration'], hue: 16, hair: [], ing: ['Alcohol Denat.','Parfum','Mysore Sandalwood','Cashmeran','Benzoin'], ben: ['10-hour longevity','Creamy, skin-safe','Award-winning formula'], desc: 'A silky sandalwood parfum inspired by Mysore temples. Creamy, warm and utterly addictive — this is a second-skin scent.', shades: [], bs: true, na: false, tr: false, sizes: ['50 ml','100 ml'] },
  // Skincare - more
  { name: 'Clay Purifying Mask', brand: 'Dune Botanica', cat: 'skincare', sub: 'Masks', price: 1099, disc: 0, skin: ['Oily','Combination'], conc: ['Acne','Redness'], hue: 36, hair: [], ing: ['Kaolin Clay','Bentonite','Turmeric','Tea Tree'], ben: ['Deep pore cleanse','Reduces blackheads','Brightening'], desc: 'A two-clay mask with turmeric and tea tree to draw out impurities, reduce inflammation and brighten with each weekly use.', shades: [], bs: false, na: false, tr: false },
  { name: 'Peptide Eye Cream', brand: 'Bloom Theory', cat: 'skincare', sub: 'Eye Care', price: 1599, disc: 0, skin: ['All'], conc: ['Ageing','Hydration'], hue: 32, hair: [], ing: ['Matrixyl 3000','Caffeine','Hyaluronic Acid','Vitamin K'], ben: ['Reduces dark circles','Firms crow\'s feet','Depuffs'], desc: 'An eye cream with Matrixyl 3000 and caffeine to target dark circles, puffiness and fine lines around the delicate eye area.', shades: [], bs: true, na: false, tr: false },
  { name: 'AHA Glow Exfoliant', brand: 'Lumen Lab', cat: 'skincare', sub: 'Treatments', price: 1399, disc: 15, skin: ['Normal','Combination'], conc: ['Dullness','Ageing'], hue: 34, hair: [], ing: ['Glycolic Acid 10%','Lactic Acid 5%','Aloe Vera','Panthenol'], ben: ['Resurfaces in 5 minutes','Reduces hyperpigmentation','Chemical exfoliation'], desc: 'A leave-on exfoliant with glycolic and lactic acid to resurface, brighten and smooth skin texture over time. Use two to three times a week.', shades: [], bs: false, na: false, tr: true },
  { name: 'Cica Calming Toner', brand: 'Kori Skin', cat: 'skincare', sub: 'Toners', price: 849, disc: 0, skin: ['Sensitive','Dry'], conc: ['Redness','Hydration'], hue: 28, hair: [], ing: ['Centella Asiatica','Madecassoside','Hyaluronic Acid','Betaine'], ben: ['Calms redness instantly','Hydrates and plumps','Fragrance-free'], desc: 'A soothing centella toner that calms reactive skin on contact. Layer it like an essence for a glass-skin glow.', shades: [], bs: false, na: true, tr: false },
  { name: 'Ceramide Barrier Balm', brand: 'Solene', cat: 'skincare', sub: 'Moisturisers', price: 1199, disc: 0, skin: ['Dry','Sensitive'], conc: ['Redness','Hydration'], hue: 26, hair: [], ing: ['Ceramides NP+AP+EOP','Cholesterol','Fatty Acids','Shea Butter'], ben: ['Repairs skin barrier','24-hour moisture','No fragrance'], desc: 'A rich balm formulated with the three essential ceramides, cholesterol and fatty acids that make up the skin barrier. For compromised or very dry skin.', shades: [], bs: false, na: false, tr: false }
]

const COUPONS = [
  { code: 'BEAUTIQ10', type: 'percent', value: 10, minOrder: 0, description: '10% off your order — no minimum', usageLimit: null, perUserLimit: 1, isActive: true, expiry: new Date('2027-12-31') },
  { code: 'WELCOME15', type: 'percent', value: 15, minOrder: 999, description: '15% off for new customers on orders above ₹999', usageLimit: null, perUserLimit: 1, isActive: true, expiry: new Date('2027-06-30') },
  { code: 'FLAT200', type: 'flat', value: 200, minOrder: 1500, maxDiscount: 200, description: '₹200 off orders above ₹1,500', usageLimit: 500, perUserLimit: 1, isActive: true, expiry: new Date('2026-12-31') },
  { code: 'FESTIVE25', type: 'percent', value: 25, minOrder: 3000, maxDiscount: 1000, description: 'Festive season special — 25% off orders above ₹3,000', usageLimit: 200, perUserLimit: 1, isActive: false, expiry: new Date('2026-06-30') }
]

const ARTICLES = [
  { title: 'The Quiet Skincare Routine', slug: 'the-quiet-skincare-routine', subtitle: 'Five steps, ten minutes, and nothing your skin did not ask for.', category: 'Routines', authorName: 'Ira Menon', authorRole: 'Beauty Editor', authorHue: 14, readTime: 7, hue: 24, tags: ['routine','minimal','barrier'], excerpt: 'Somewhere between the ten-step ritual and the viral serum of the week, many of us lost sight of what skin actually needs.', content: [{type:'p',text:'Somewhere between the ten-step ritual and the viral serum of the week, many of us lost sight of what skin actually needs: cleansing, hydration, protection, and patience.'},{type:'h2',text:'Start with a cleanser that leaves you comfortable'},{type:'p',text:'Skin should feel soft and clean after cleansing, never squeaky. Squeaky means the barrier has been stripped, and a stripped barrier is the beginning of most irritation we see.'},{type:'quote',text:'The best routine is the one you will still be doing in six months.'}] },
  { title: 'Vitamin C, Demystified', slug: 'vitamin-c-demystified', subtitle: 'What it does, how to layer it, and why your bottle turned orange.', category: 'Ingredients', authorName: 'Dr. Devika Rao', authorRole: 'Consultant Dermatologist', authorHue: 30, readTime: 6, hue: 34, tags: ['vitamin c','antioxidant','serum'], excerpt: 'Vitamin C is one of the few ingredients with decades of evidence behind it. It brightens, evens tone and helps defend skin from daily environmental stress.', content: [{type:'p',text:'Vitamin C is one of the few ingredients with decades of evidence behind it. It brightens, evens tone and helps defend skin from daily environmental stress.'},{type:'h2',text:'Percentages are not the whole story'},{type:'p',text:'A well-formulated 10–15 percent serum can outperform a poorly stabilised 20 percent one. Look for opaque, airless packaging and a pH that keeps the vitamin active.'},{type:'quote',text:'Think of vitamin C as the daytime ingredient that works while you simply live your life.'}] },
  { title: 'The Soft-Focus Face', slug: 'the-soft-focus-face', subtitle: 'A base routine that looks like skin, only quieter.', category: 'Makeup', authorName: 'Sahil Arora', authorRole: 'Celebrity Makeup Artist', authorHue: 22, readTime: 8, hue: 18, tags: ['base','complexion','natural'], excerpt: 'The most requested look in my chair this year is the one that does not look like makeup at all.', content: [{type:'p',text:'The most requested look in my chair this year is the one that does not look like makeup at all. Think blurred edges, diffused light and colour that seems to come from within.'},{type:'h2',text:'Prep with intention'},{type:'p',text:'Hydrate, then press a thin layer of primer only where you see texture — usually around the nose and cheeks. Leave the rest of the face free.'},{type:'quote',text:'Skin is the best accessory. Our job is simply to edit it.'}] },
  { title: 'The Curl Wash-Day Ritual', slug: 'curl-wash-day-ritual', subtitle: 'Definition, bounce and no frizz — a step-by-step guide for waves to coils.', category: 'Tutorials', authorName: 'Noor Fatima', authorRole: 'Trichologist & Hair Stylist', authorHue: 38, readTime: 9, hue: 38, tags: ['curls','wash day','hydration'], excerpt: 'Curls are not difficult; they are thirsty. Most frizz traces back to moisture lost between wash days.', content: [{type:'p',text:'Curls are not difficult; they are thirsty. Most frizz traces back to moisture lost between wash days and disturbed curl clumps.'},{type:'h2',text:'Cleanse the scalp, not the lengths'},{type:'p',text:'Focus shampoo on the scalp and let the suds run down. Rinse thoroughly, then condition mid-lengths to ends and detangle with fingers or a wide-tooth comb while the conditioner is still in.'},{type:'quote',text:'Your curls will tell you what they need if you pay attention.'}] },
  { title: 'How to Wear Fragrance Like You Mean It', slug: 'how-to-wear-fragrance', subtitle: 'Pulse points, layering, and the myth of the single signature scent.', category: 'Fragrance', authorName: 'Kavya Iyer', authorRole: 'Fragrance Writer', authorHue: 8, readTime: 6, hue: 8, tags: ['perfume','layering','notes'], excerpt: 'A fragrance is not a finishing touch — it is a way of arriving.', content: [{type:'p',text:'A fragrance is not a finishing touch — it is a way of arriving. Worn well, it enters the room slightly before you do and lingers slightly after you leave.'},{type:'h2',text:'Apply to moisturised skin'},{type:'p',text:'Fragrance clings to hydrated skin. Smooth on an unscented balm first, then spray the wrists, the base of the throat and behind the knees.'},{type:'quote',text:'The best fragrance is the one people ask about, not the one they smell from across the room.'}] }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ Connected to MongoDB')

    // Clear
    await Promise.all([User.deleteMany(), Brand.deleteMany(), Category.deleteMany(), Product.deleteMany(), Coupon.deleteMany(), Article.deleteMany(), Review.deleteMany()])
    console.log('✓ Collections cleared')

    // Admin
    const adminPassword = await bcrypt.hash('Admin@123', 12)
    const admin = await User.create({ name: 'Meera Kapoor', email: 'admin@beautiq.in', password: adminPassword, role: 'admin', isVerified: true, phone: '9810011223' })
    await User.create({ name: 'Aanya Sharma', email: 'aanya.sharma@example.com', password: await bcrypt.hash('Beautiq@123', 12), role: 'customer', isVerified: true, phone: '9811234567' })
    console.log('✓ Users seeded')

    // Brands
    const brandDocs = await Brand.insertMany(BRANDS.map(b => ({ name: b.name, slug: makeSlug(b.name), description: b.desc, isActive: true })))
    const brandMap = {}; brandDocs.forEach(b => { brandMap[b.name] = b._id }); console.log(`✓ ${brandDocs.length} brands seeded`)

    // Categories
    await Category.insertMany(CATEGORIES); console.log('✓ Categories seeded')

    // Products
    const productDocs = await Product.insertMany(PRODUCTS.map(p => ({
      name: p.name, slug: makeSlug(p.name), brand: p.brand, brandId: brandMap[p.brand], category: p.cat, subcategory: p.sub,
      price: Math.round(p.price * (1 - (p.disc||0)/100)), originalPrice: p.price, discount: p.disc||0,
description: p.desc,
images: [
  p.category === 'Makeup'
    ? 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
    : p.category === 'Skincare'
    ? 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
    : p.category === 'Haircare'
    ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'
    : 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
],
thumbnail:
  p.category === 'Makeup'
    ? 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'
    : p.category === 'Skincare'
    ? 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80'
    : p.category === 'Haircare'
    ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'
    : 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
      shades: p.shades||[], size: p.sizes||['30 ml','50 ml'], ingredients: p.ing||[], benefits: p.ben||[], skinTypes: p.skin||[], concerns: p.conc||[], hairTypes: p.hair||[],
      rating: 4.5, reviewCount: Math.floor(Math.random() * 500) + 50, stock: Math.floor(Math.random() * 50) + 5, bestseller: p.bs||false, newArrival: p.na||false, trending: p.tr||false, hue: p.hue||20
    })))
    console.log(`✓ ${productDocs.length} products seeded`)

    // Coupons
    await Coupon.insertMany(COUPONS); console.log('✓ Coupons seeded')

    // Articles
    await Article.insertMany(ARTICLES.map(a => ({ ...a, status: 'published', publishedAt: new Date() }))); console.log('✓ Articles seeded')

    console.log('\n✓ BEAUTIQ database seeded successfully!\n')
    console.log('  Admin: admin@beautiq.in / Admin@123')
    console.log('  Customer: aanya.sharma@example.com / Beautiq@123')
  } catch (err) { console.error('Seed error:', err) }
  finally { await mongoose.disconnect(); process.exit(0) }
}

seed()
