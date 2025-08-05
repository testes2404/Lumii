import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Mesma lógica de engajar.html para pegar usuário logado
const companyEmail = localStorage.getItem('companyEmail');
if (!companyEmail) {
  alert('Usuário não autenticado. Faça login novamente.');
  throw new Error('companyEmail não encontrado no localStorage');
}

// Config inicial do Firebase (mesma do engajar.html)
const firebaseConfig = {
  apiKey: "AIzaSyDjys-U4aBy5SMXTasOp_TsfqziuqnEc9o",
  authDomain: "mini-genio-c204d.firebaseapp.com",
  projectId: "mini-genio-c204d",
  storageBucket: "mini-genio-c204d.firebasestorage.app",
  messagingSenderId: "553494129644",
  appId: "1:553494129644:web:cc6f0de9d013392fc4eec9"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Inicializa o filtro Majoris dentro do modal
 * @param {string} vagaId ID da vaga clicada
 * @param {HTMLElement} container Elemento onde renderizar
 */
export function initializeMajoris(vagaId, container) {
  container.innerHTML = '';

  // Cria UI de filtro
  const filtroDiv = document.createElement('div');
  filtroDiv.className = 'majoris-filter';
  filtroDiv.innerHTML = `
    <label>
      Vaga ID:
      <input type="text" id="majoris-vaga-id" readonly />
    </label>
    <label>
      Email do candidato:
      <input type="text" id="majoris-email-filter" placeholder="Digite parte do email" />
    </label>
    <button id="majoris-search-btn">Buscar</button>
    <div id="majoris-results"></div>
  `;
  container.appendChild(filtroDiv);

  const vagaInput = filtroDiv.querySelector('#majoris-vaga-id');
  const emailInput = filtroDiv.querySelector('#majoris-email-filter');
  const resultsDiv = filtroDiv.querySelector('#majoris-results');
  vagaInput.value = vagaId;

  // Ao clicar em Buscar
  filtroDiv.querySelector('#majoris-search-btn')
    .addEventListener('click', async () => {
      resultsDiv.innerHTML = '<em>Carregando...</em>';

      try {
        // buscar título da vaga
        const vagaSnap = await getDoc(doc(db, 'vagas', vagaId));
        const vagaTitle = vagaSnap.exists() ? vagaSnap.data().title : 'Vaga sem título';

        // montar consulta de respostas filtrando por vagaId e, opcionalmente, email
        const respostasRef = collection(db, 'respostas-valores-dinamicas-trilhas');
        const emailFiltro = emailInput.value.trim();
        let q;
        if (emailFiltro) {
          // filtra por vagaId + email aproximado (>=prefixo e <=prefixo+~)
          q = query(
            respostasRef,
            where('vagaId', '==', vagaId),
            where('__name__', '>=', emailFiltro),
            where('__name__', '<=', emailFiltro + '\uf8ff')
          );
        } else {
          // somente por vagaId
          q = query(respostasRef, where('vagaId', '==', vagaId));
        }
        const snap = await getDocs(q);

        resultsDiv.innerHTML = '';
        if (snap.empty) {
          resultsDiv.textContent = 'Nenhum registro encontrado.';
          return;
        }

        // exibe cada correspondência
        snap.forEach(docSnap => {
          const candidateEmail = docSnap.id;
          // mascara parte do email
          const partial = candidateEmail.replace(/(.{3}).+(@.+)/, '$1***$2');
          const item = document.createElement('div');
          item.className = 'majoris-item';
          item.textContent = `${vagaTitle} — ${partial}`;
          resultsDiv.appendChild(item);
        });
      } catch (err) {
        resultsDiv.textContent = 'Erro ao buscar registros.';
        console.error(err);
      }
    });
}
