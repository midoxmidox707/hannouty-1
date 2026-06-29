import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HERO SECTION ==================== */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Bienvenue chez <span className="text-yellow-400">Hannouty</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Vos produits alimentaires préférés livrés à domicile à prix réduit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition"
            >
              Créer un compte
            </Link>
            <Link 
              href="/products" 
              className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== AVANTAGES ==================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir Hannouty ?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
            <p className="text-gray-600">Recevez vos produits en moins de 2 heures dans votre ville.</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Prix Réduits</h3>
            <p className="text-gray-600">Bénéficiez de réductions selon votre niveau de fidélité.</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Large Choix</h3>
            <p className="text-gray-600">Huile, sucre, lait, épices et bien plus encore.</p>
          </div>
        </div>
      </section>

      {/* ==================== CATÉGORIES ==================== */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Catégories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Huiles", emoji: "🫒" },
              { name: "Sucres", emoji: "🧂" },
              { name: "Lait & Produits Laitiers", emoji: "🥛" },
              { name: "Épices & Condiments", emoji: "🌶️" },
            ].map((cat, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow text-center hover:shadow-lg transition"
              >
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-xl font-semibold">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CALL TO ACTION ==================== */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8">Inscrivez-vous gratuitement et profitez de nos offres.</p>
          <Link 
            href="/signup" 
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition"
          >
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Hannouty. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}