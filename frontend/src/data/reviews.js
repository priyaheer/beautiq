import { products } from './index'
import { users, reviewerPool } from './users'
import { rng } from '../lib/format'

const R = rng(20260930)
const pick = a => a[Math.floor(R() * a.length)]
const BASE = Date.UTC(2026, 8, 24)
const day = 86400000

const titles = { 5: ['Worth every rupee', 'My new holy grail', 'Absolutely love it', 'Better than I expected', 'Repurchasing already', 'Pure luxury'], 4: ['Really good', 'Lovely, with one small quibble', 'Happy with this', 'Solid and reliable', 'Almost perfect'], 3: ['It is fine', 'Decent but not special', 'Mixed feelings'], 2: ['Not for me', 'Expected more'], 1: ['Disappointed', 'Did not work for me'] }
const open = { 5: ['I have been using this for about a month and', 'Picked this up on a recommendation and', 'Third bottle in and', 'Bought it for a trip and'], 4: ['After three weeks of use,', 'Used it daily for two weeks and', 'Gave this a proper try and'], 3: ['I wanted to love this, but', 'After two weeks,', 'Honest take:'], 2: ['I really tried to make this work, but', 'After ten days,'], 1: ['Sorry to say,', 'I gave it a full month and'] }
const body = {
  makeup: ['the pigment is rich and it blends without fuss.', 'the finish looks skin-like and does not settle into fine lines.', 'it stayed put through a long wedding day in Delhi humidity.', 'the shade range is thoughtful and my undertone finally has a match.', 'it layers beautifully without going cakey.', 'the texture is creamy and comfortable on the lips.', 'the packaging feels premium and the applicator is precise.', 'it photographs really well in daylight.'],
  skincare: ['my skin feels calmer and more hydrated by morning.', 'it absorbs quickly and sits well under sunscreen and makeup.', 'there is no stinging, even on my reactive cheeks.', 'I can see a visible glow around the two-week mark.', 'the texture is light but surprisingly nourishing.', 'it plays nicely with the rest of my routine.', 'the pump dispenses just the right amount.', 'my breakouts have quietened down noticeably.'],
  haircare: ['my hair feels softer and far less frizzy after one wash.', 'it detangles easily and leaves no heavy residue.', 'my scalp feels clean without that tight, stripped feeling.', 'the shine lasts through the day, even in monsoon weather.', 'curls are more defined and stay bouncy.', 'the scent is subtle and spa-like.', 'less breakage on the brush, which I did not expect.', 'a little goes a long way, so the bottle lasts.'],
  fragrance: ['the opening is bright and then settles into something warm and intimate.', 'it lasts a solid six to eight hours on my skin.', 'I get compliments every time I wear it.', 'the dry-down is elegant and never cloying.', 'projection is moderate, which is perfect for the office.', 'the bottle is beautiful and feels weighty.', 'it is layered and unfolds slowly through the day.', 'a very wearable scent for evenings.'] }
const negative = ['it felt too heavy on my skin and did not wear well.', 'the results were not noticeable at all after weeks of use.', 'the scent was stronger than I like and gave me a headache.', 'it irritated my skin slightly, so I stopped using it.', 'it faded much faster than I expected for the price.']
const close = { 5: ['Highly recommend.', 'Will definitely repurchase.', 'Packaging arrived perfectly too.', 'Delivery was quick as well.'], 4: ['Would buy again.', 'Good value overall.', 'Recommended.'], 3: ['Might try something else next time.', 'Okay for the price.'], 2: ['Would not repurchase.', 'Hoping the next batch is better.'], 1: ['Returning this.', 'Not recommended.'] }

// star weights biased toward each product's catalogue rating so cards and breakdown tell the same story
const drawRating = target => { const w = [1, 2, 3, 4, 5].map(k => Math.exp(1.15 * (target - 3.2) * (k - 3) / 1.6 + (k === 5 ? 0.3 : 0))); let s = w.reduce((a, b) => a + b, 0) * R(), k = 0
  while (k < 4 && (s -= w[k]) > 0) k++; return k + 1 }

const nameFor = () => { if (R() < 0.45) { const u = pick(users.filter(x => x.role === 'customer')); return { userId: u.id, userName: u.name } }
  const n = pick(reviewerPool); return { userId: `r-${n.toLowerCase().replace(/\W+/g, '')}`, userName: n } }
const shortName = n => { const [f, ...r] = n.split(' '); return r.length ? `${f} ${r[r.length - 1][0]}.` : f }

export const reviews = [], customerPhotos = []
const captions = { makeup: ['Swatched in natural light', 'Everyday look with this', 'Shade match on my skin', 'After four hours of wear', 'Out of the box'], skincare: ['My shelf this month', 'Texture shot', 'Day 14 skin check', 'Part of my night routine', 'Unboxing'], haircare: ['Wash day result', 'Curls after styling', 'Shine in daylight', 'Before and after', 'Bathroom shelf'], fragrance: ['The bottle in the sun', 'Evening ready', 'Vanity corner', 'Gifted to myself', 'Collection update'] }

products.forEach(p => {
  const count = 2 + Math.floor(R() * 3) // 2-4 written reviews per product
  for (let i = 0; i < count; i++) {
    const rating = drawRating(p.rating), who = nameFor(), id = `rv${reviews.length + 1}`
    const comment = `${pick(open[rating])} ${rating <= 2 ? pick(negative) : pick(body[p.category])} ${rating >= 4 && R() < 0.5 ? pick(body[p.category]).replace(/^./, c => c.toUpperCase()) + ' ' : ''}${pick(close[rating])}`
    const photos = []
    if (rating >= 4 && R() < 0.3) { const n = 1 + (R() < 0.3 ? 1 : 0); for (let k = 0; k < n; k++) { const pid = `ph${customerPhotos.length + 1}`; photos.push(pid)
      customerPhotos.push({ id: pid, productId: p.id, reviewId: id, userName: shortName(who.userName), caption: pick(captions[p.category]), hue: (p.hue + k * 14 + Math.floor(R() * 20)) % 60, variant: Math.floor(R() * 4) }) } }
    const status = R() < 0.04 ? 'pending' : R() < 0.015 ? 'rejected' : 'approved'
    reviews.push({ id, productId: p.id, ...who, rating, title: pick(titles[rating]), comment: comment.replace(/\s+/g, ' ').trim(), date: new Date(BASE - Math.floor(R() * 520) * day).toISOString().slice(0, 10),
      verifiedPurchase: R() < 0.82, helpful: Math.floor(R() * 60 * (rating >= 4 ? 1 : 0.4)), photos, status })
  }
  // a couple of standalone customer photos for popular products
  if (R() < 0.35) { const who = nameFor(); customerPhotos.push({ id: `ph${customerPhotos.length + 1}`, productId: p.id, reviewId: null, userName: shortName(who.userName), caption: pick(captions[p.category]), hue: (p.hue + Math.floor(R() * 24)) % 60, variant: Math.floor(R() * 4) }) }
})
// guarantee every product has at least two photos so the gallery is never empty
products.forEach(p => { while (customerPhotos.filter(x => x.productId === p.id).length < 2) { const who = nameFor()
  customerPhotos.push({ id: `ph${customerPhotos.length + 1}`, productId: p.id, reviewId: null, userName: shortName(who.userName), caption: pick(captions[p.category]), hue: (p.hue + Math.floor(R() * 24)) % 60, variant: Math.floor(R() * 4) }) } })
