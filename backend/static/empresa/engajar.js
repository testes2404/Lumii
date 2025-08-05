// ✅ 1. Buscar o e-mail da empresa no localStorage
const companyEmail = localStorage.getItem('companyEmail');

// ✅ 2. Verificar se existe o e-mail
if (!companyEmail) {
  alert('Usuário não autenticado. Faça login novamente.');
  throw new Error('companyEmail não encontrado no localStorage');
}

// ✅ 3. Criar um badge visual no canto superior esquerdo do modal
const badge = document.createElement('div');
badge.textContent = `Empresa: ${companyEmail}`;
badge.style.position = 'absolute';
badge.style.top = '1rem';
badge.style.left = '1rem';
badge.style.background = 'rgba(0, 255, 0, 0.15)';
badge.style.color = '#B2FFB2';
badge.style.padding = '0.4rem 1rem';
badge.style.borderRadius = '8px';
badge.style.fontSize = '0.9rem';
badge.style.fontWeight = '600';
badge.style.backdropFilter = 'blur(6px)';
badge.style.zIndex = '10';

// ✅ 4. Inserir o badge dentro do modal engajarContent
const container = document.getElementById('engajarContent');
if (container) {
  container.appendChild(badge);
} else {
  console.error('Elemento #engajarContent não encontrado.');
}

// ✅ 5. Mostrar texto inicial "Carregando..."
const inner = document.getElementById('engajarInner');
if (inner) {
  inner.innerHTML = '<p style="padding:1rem;">Carregando conteúdo...</p>';
}

// ✅ 6. Firebase Imports e leitura dos dados
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ 7. Firebase Config (seu projeto real)
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

// ✅ 8. Função para buscar conteúdos da empresa
async function carregarConteudos() {
  try {
    const q = query(
      collection(db, 'materiais_aperfeicoamento'),
      where('empresaEmail', '==', companyEmail)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      inner.innerHTML = "<p style='padding:1rem;'>Nenhum conteúdo encontrado.</p>";
      return;
    }

    inner.innerHTML = ""; // limpar "Carregando..."

    querySnapshot.forEach((docSnap) => {
      const dados = docSnap.data();

      const bloco = document.createElement('div');
      bloco.style.background = 'rgba(255,255,255,0.05)';
      bloco.style.border = '1px solid rgba(255,255,255,0.08)';
      bloco.style.borderRadius = '10px';
      bloco.style.padding = '1rem';
      bloco.style.marginTop = '4.5rem'; // ✅ Margem suficiente abaixo do badge
      bloco.style.marginBottom = '1rem';
      bloco.style.display = 'flex';
      bloco.style.justifyContent = 'space-between';
      bloco.style.alignItems = 'center';
      bloco.style.backdropFilter = 'blur(6px)';
      bloco.style.color = '#fff';
      bloco.style.fontSize = '0.95rem';

      // ✅ Dados verticais
      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.gap = '0.4rem';

      const nome = document.createElement('div');
      nome.innerHTML = `<strong>nome:</strong> ${dados.nome}`;

      const tipo = document.createElement('div');
      tipo.innerHTML = `<strong>tipo:</strong> ${dados.tipo}`;

      info.appendChild(nome);
      info.appendChild(tipo);

      // ✅ Botão excluir
      const btn = document.createElement('button');
      btn.textContent = 'Excluir';
      btn.style.background = '#ff2d2d';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.padding = '0.5rem 1rem';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';

      btn.onclick = async () => {
        const confirmar = confirm('Deseja realmente excluir este conteúdo?');
        if (confirmar) {
          await deleteDoc(doc(db, 'materiais_aperfeicoamento', docSnap.id));
          bloco.remove();
        }
      };

      bloco.appendChild(info);
      bloco.appendChild(btn);
      inner.appendChild(bloco);
    });
  } catch (e) {
    console.error('Erro ao carregar conteúdos:', e);
    inner.innerHTML = "<p style='padding:1rem; color:#f66;'>Erro ao carregar conteúdos.</p>";
  }
}

// ✅ Executar função
carregarConteudos();
