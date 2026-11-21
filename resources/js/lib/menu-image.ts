/**
 * Automatic high-resolution menu photo matcher for cafe products
 */
export const getAutoMenuImage = (productName: string): string => {
    const nameLower = (productName || '').toLowerCase().trim();
    if (nameLower.includes('pain au choco') || nameLower.includes('pain au chocolat')) return '/storage/products/auto/pain-au-choco.jpg';
    if (nameLower.includes('ribbon choco') || nameLower.includes('ribbon')) return '/storage/products/auto/ribbon-choco.jpg';
    if (nameLower.includes('cheezma') || nameLower.includes('keju')) return '/storage/products/auto/croissant-cheese.jpg';
    if (nameLower.includes('almond')) return '/storage/products/auto/croissant-almond.jpg';
    if (nameLower.includes('buttrella') || nameLower.includes('croissant') || nameLower.startsWith('cr ')) return '/storage/products/auto/croissant-butter.jpg';
    if (nameLower.includes('mix platter') || nameLower.includes('platter')) return '/storage/products/auto/mix-platter.jpg';
    if (nameLower.includes('tahu') || nameLower.includes('cagram')) return '/storage/products/auto/tahu-cagram.jpg';
    if (nameLower.includes('tempe') || nameLower.includes('mendoan')) return '/storage/products/auto/tempe-mendoan.jpg';
    if (nameLower.includes('donut') || nameLower.includes('donat')) return '/storage/products/auto/donuts.jpg';
    if (nameLower.includes('french fries') || nameLower.includes('fries') || nameLower.includes('kentang')) return '/storage/products/auto/french-fries.jpg';
    if (nameLower.includes('cookie')) return '/storage/products/auto/cookies.jpg';
    if (nameLower.includes('carbonara')) return '/storage/products/auto/carbonara.jpg';
    if (nameLower.includes('bolognese') || nameLower.includes('bolongnese') || nameLower.includes('spaghetti') || nameLower.includes('sphagetti')) return '/storage/products/auto/bolognese.jpg';
    if (nameLower.includes('mie goreng')) return '/storage/products/auto/mie-goreng.jpg';
    if (nameLower.includes('mie ghodog') || nameLower.includes('mie godhog') || nameLower.includes('mie kuah')) return '/storage/products/auto/mie-kuah.jpg';
    if (nameLower.includes('chiken') || nameLower.includes('chicken') || nameLower.includes('rice bowl')) return '/storage/products/auto/chicken-rice-bowl.jpg';
    if (nameLower.includes('es kopi susu') || nameLower.includes('kopi susu') || nameLower.includes('gula aren')) return '/storage/products/auto/es-kopi-susu.jpg';
    if (nameLower.includes('matcha') || nameLower.includes('green tea')) return '/storage/products/auto/matcha-latte.jpg';
    if (nameLower.includes('choco') || nameLower.includes('chocolate') || nameLower.includes('cokelat')) return '/storage/products/auto/chocolate.jpg';
    if (nameLower.includes('berry') || nameLower.includes('strawberry')) return '/storage/products/auto/berry-lactose.jpg';
    if (nameLower.includes('biscoff') || nameLower.includes('biscofee')) return '/storage/products/auto/biscoff-latte.jpg';
    if (nameLower.includes('split') || nameLower.includes('magic')) return '/storage/products/auto/magic-latte.jpg';
    if (nameLower.includes('dirty')) return '/storage/products/auto/dirty-latte.jpg';
    if (nameLower.includes('hazelnut')) return '/storage/products/auto/hazelnut-latte.jpg';
    if (nameLower.includes('mochacino') || nameLower.includes('mochaccino') || nameLower.includes('mocha')) return '/storage/products/auto/mochacino.jpg';
    if (nameLower.includes('cappucino') || nameLower.includes('cappuccino')) return '/storage/products/auto/cappuccino.jpg';
    if (nameLower.includes('americano') || nameLower.includes('long black') || nameLower.includes('espresso')) return '/storage/products/auto/americano.jpg';
    if (nameLower.includes('cafe latte') || nameLower.includes('latte')) return '/storage/products/auto/cafe-latte.jpg';
    if (nameLower.includes('v60') || nameLower.includes('filter') || nameLower.includes('manual brew')) return '/storage/products/auto/v60-filter.jpg';
    if (nameLower.includes('tubruk susu')) return '/storage/products/auto/tubruk-susu.jpg';
    if (nameLower.includes('tubruk')) return '/storage/products/auto/kopi-tubruk.jpg';
    if (nameLower.includes('vietnam drip')) return '/storage/products/auto/vietnam-drip.jpg';
    if (nameLower.includes('rosella') || nameLower.includes('roasella')) return '/storage/products/auto/rosella-tea.jpg';
    if (nameLower.includes('lychee') || nameLower.includes('leci')) return '/storage/products/auto/lychee-tea.jpg';
    if (nameLower.includes('lemon tea') || nameLower.includes('tea') || nameLower.includes('teh')) return '/storage/products/auto/lemon-tea.jpg';
    if (nameLower.includes('sanubiru') || nameLower.includes('curacao')) return '/storage/products/auto/sanubiru-blue.jpg';
    if (nameLower.includes('honey moon') || nameLower.includes('la la land') || nameLower.includes('mocktail')) return '/storage/products/auto/honeymoon-mocktail.jpg';
    if (nameLower.includes('air mineral') || nameLower.includes('mineral') || nameLower.includes('water')) return '/storage/products/auto/air-mineral.jpg';
    if (nameLower.includes('tumbler') || nameLower.includes('botol')) return '/storage/products/auto/tumbler.jpg';
    return '/storage/products/auto/cafe-latte.jpg';
};
