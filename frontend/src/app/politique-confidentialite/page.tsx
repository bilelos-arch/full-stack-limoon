import React from 'react';

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité de Liverté
          </h1>
          <p className="text-gray-600 text-sm">
            Dernière mise à jour : Novembre 2025
          </p>
        </header>

        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p>
            Chez Liverté, nous croyons que chaque histoire appartient à celui qui la vit — et à personne d’autre.
            La confiance que vous nous accordez lorsque vous créez une histoire personnalisée pour votre enfant est essentielle.
            Cette politique de confidentialité explique comment nous collectons, utilisons, protégeons et supprimons vos données, en particulier les photos et prénoms d’enfants que vous nous confiez.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Qui sommes-nous ?</h2>
            <p>
              Liverté est une plateforme créative qui permet aux parents de générer des histoires personnalisées pour leurs enfants.
              Notre mission : offrir des récits uniques et bienveillants, tout en garantissant la confidentialité absolue des informations que vous partagez.
            </p>
            <p className="mt-4">
              Le responsable du traitement des données est :
            </p>
            <p className="font-medium">
              Liverté — Application web éditée par [Nom du créateur ou entreprise]<br />
              Contact : support@liverté.app
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données que nous collectons</h2>
            <p>
              Nous collectons uniquement les données strictement nécessaires à la personnalisation de votre histoire :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Le prénom de l’enfant</li>
              <li>Une photo de l’enfant (facultative)</li>
              <li>Le sexe et/ou âge approximatif (si vous choisissez de les indiquer)</li>
              <li>Votre adresse e-mail (pour l’envoi du lien de téléchargement de l’histoire)</li>
              <li>Les préférences de personnalisation (choix du héros, du décor, etc.)</li>
            </ul>
            <p className="mt-4">
              Nous ne collectons aucune donnée technique ou personnelle supplémentaire (adresse IP, géolocalisation, historique de navigation, etc.) au-delà des besoins de fonctionnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Utilisation des données</h2>
            <p>
              Les informations que vous fournissez servent uniquement à générer l’histoire personnalisée que vous avez commandée.
              Elles ne sont jamais utilisées à des fins publicitaires, analytiques ou statistiques.
            </p>
            <p className="mt-4">
              Plus précisément :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Le prénom est inséré dans le texte de l’histoire.</li>
              <li>La photo est utilisée, si vous l’avez fournie, pour générer une illustration personnalisée.</li>
            </ul>
            <p className="mt-4">
              Ces données sont traitées automatiquement par nos systèmes sécurisés et ne sont pas examinées par des humains.
            </p>
            <p>
              Le fichier final (PDF ou image) vous est remis, puis les données sources sont supprimées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Suppression automatique et définitive</h2>
            <p>
              Nous appliquons une politique stricte de suppression immédiate :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Toutes les photos, prénoms et informations personnelles sont supprimés définitivement de nos serveurs dès la génération finale de votre histoire.</li>
              <li>Aucun fichier temporaire n’est conservé au-delà de 24 heures (même en cas d’erreur ou d’interruption).</li>
              <li>Nous n’effectuons aucune sauvegarde ni copie de ces données à des fins ultérieures.</li>
            </ul>
            <p className="mt-4">
              Vous pouvez également demander une suppression manuelle anticipée à tout moment via support@liverté.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Hébergement et sécurité</h2>
            <p>
              Nos serveurs sont hébergés sur des infrastructures sécurisées conformes aux standards internationaux (ISO 27001, RGPD).
              Toutes les données sont :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Chiffrées lors de leur transfert (HTTPS, TLS 1.3)</li>
              <li>Stockées temporairement sur des serveurs situés dans des centres de données fiables</li>
              <li>Effacées de manière irréversible après utilisation.</li>
            </ul>
            <p className="mt-4">
              Aucune donnée sensible n’est transmise à des tiers ni utilisée pour entraîner des modèles d’intelligence artificielle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Partage des données</h2>
            <p>
              Liverté ne partage jamais vos données personnelles avec :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Des partenaires commerciaux, annonceurs ou plateformes publicitaires.</li>
              <li>Des services d’analyse ou de marketing.</li>
              <li>Des prestataires externes autres que ceux strictement nécessaires à la génération technique de l’histoire.</li>
            </ul>
            <p className="mt-4">
              En d’autres termes :
            </p>
            <p>
              Vos données ne quittent jamais notre environnement sécurisé et ne servent qu’à votre histoire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Vos droits</h2>
            <p>
              Vous disposez de tous les droits prévus par la législation sur la protection des données personnelles :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Droit d’accès : obtenir une copie de vos données.</li>
              <li>Droit de rectification : corriger une information erronée.</li>
              <li>Droit à l’effacement : demander la suppression immédiate de vos données.</li>
              <li>Droit à la portabilité : récupérer les fichiers que vous avez fournis.</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits :
            </p>
            <p className="font-medium">
              👉 Contactez-nous à privacy@liverté.app<br />
              Votre demande sera traitée sous 48 heures maximum.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies et suivi</h2>
            <p>
              Liverté n’utilise aucun cookie publicitaire ou de suivi comportemental.
              Seuls des cookies techniques essentiels au bon fonctionnement du site peuvent être utilisés (par exemple, pour conserver la session d’un utilisateur connecté).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications de la politique</h2>
            <p>
              Cette politique de confidentialité peut être mise à jour pour s’adapter à de nouvelles exigences légales ou à des évolutions techniques.
              En cas de modification significative, nous vous en informerons clairement sur le site avant l’entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Engagement éthique</h2>
            <p>
              Nous croyons en un numérique responsable, bienveillant et respectueux des familles.
              Chaque fonctionnalité de Liverté est pensée pour protéger la vie privée des enfants, et non pour l’exploiter.
              Nos modèles d’intelligence artificielle sont entraînés sur des bases de données neutres et éthiques, jamais sur des données d’utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
            <p>
              Pour toute question relative à la confidentialité, à la sécurité ou à la suppression de vos données, contactez :
            </p>
            <p className="font-medium mt-2">
              📧 privacy@liverté.app<br />
              🌐 www.liverté.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}