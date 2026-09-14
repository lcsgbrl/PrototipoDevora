import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "Como faço para solicitar uma reserva de sala?",
    a: 'Acesse a seção "Reservas" no menu lateral, clique em "Nova Reserva" (ou "Solicitar Reserva" se você for Aluno), preencha os dados da sala, data, horário e número de participantes e confirme. Alunos precisam indicar um professor responsável — a reserva fica pendente até a aprovação.',
  },
  {
    q: "Por que não consigo alterar meu cargo no perfil?",
    a: "Por questões de segurança, somente administradores podem alterar o cargo de um usuário. Essa alteração é feita na página de Membros. Caso precise mudar seu cargo, entre em contato com o administrador do sistema.",
  },
  {
    q: "Minha solicitação de reserva ficou como Pendente. O que isso significa?",
    a: "Solicitações enviadas por alunos aguardam aprovação do professor responsável indicado. Solicitações para ambientes que exigem autorização (como o Auditório Central) aguardam aprovação do coordenador. Você será notificado assim que houver uma decisão.",
  },
  {
    q: "Como cancelo uma reserva já feita?",
    a: 'Acesse "Reservas" e abra a aba "Minhas Reservas/Solicitações". Clique em "Cancelar" no card da reserva desejada. Reservas aprovadas ou em análise também podem ser canceladas enquanto não tiverem ocorrido.',
  },
  {
    q: "Por que uma sala aparece como Em Manutenção?",
    a: "O administrador do sistema pode colocar uma sala em manutenção temporariamente. Nesse estado ela não aparece na lista de seleção ao fazer uma reserva. Aguarde a reativação ou escolha outro ambiente disponível.",
  },
  {
    q: "Esqueci minha senha. Como recupero o acesso?",
    a: "Entre em contato com o suporte pelo e-mail abaixo informando seu nome completo e e-mail institucional. Um administrador irá redefinir sua senha e enviar as novas credenciais.",
  },
  {
    q: "Como faço para cadastrar um novo usuário no sistema?",
    a: 'Qualquer pessoa pode clicar em "Criar conta" na tela de login e preencher o formulário de cadastro. A solicitação ficará pendente e deverá ser aprovada por um administrador na página de Membros antes do acesso ser liberado.',
  },
];

const contacts = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "E-mail de suporte",
    value: "suporte@sga.inst.edu.br",
    action: "mailto:suporte@sga.inst.edu.br",
    actionLabel: "Enviar e-mail",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.96-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Telefone / WhatsApp",
    value: "(11) 3456-7890",
    action: "https://wa.me/551134567890",
    actionLabel: "Abrir WhatsApp",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Horário de atendimento",
    value: "Segunda a sexta, das 8h às 18h",
    action: null,
    actionLabel: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Localização do suporte",
    value: "Bloco A — Sala 110, Campus Principal",
    action: null,
    actionLabel: null,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ border: "1px solid #E7E0D5", borderRadius: "16px", overflow: "hidden", backgroundColor: open ? "#FFF" : "#FDFCFA" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1E1B15", lineHeight: 1.4 }}>{q}</span>
        <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%", backgroundColor: open ? "#FFF0F2" : "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={open ? "#8B0019" : "#776D5B"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", fontSize: "13px", lineHeight: 1.7, color: "#776D5B", borderTop: "1px solid #F3EFEA" }}>
          <p style={{ marginTop: "12px" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Suporte() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF9F6", padding: "48px 24px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Back */}
        <button
          onClick={() => navigate("/login")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#776D5B", background: "none", border: "none", cursor: "pointer", marginBottom: "32px", padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar ao login
        </button>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "#FFF0F2", marginBottom: "16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#8B0019", marginBottom: "6px" }}>SUPORTE</p>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1E1B15", marginBottom: "8px" }}>Central de Ajuda</h1>
          <p style={{ fontSize: "14px", color: "#776D5B", lineHeight: 1.6 }}>
            Encontre respostas para dúvidas frequentes ou entre em contato diretamente com nossa equipe de suporte.
          </p>
        </div>

        {/* Contact cards */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B15", marginBottom: "14px", letterSpacing: "0.04em" }}>CONTATO</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
            {contacts.map((c) => (
              <div key={c.label} style={{ backgroundColor: "#FFF", border: "1px solid #E7E0D5", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#FFF0F2", color: "#8B0019", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#A8A09A", marginBottom: "2px" }}>{c.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E1B15", wordBreak: "break-all" }}>{c.value}</div>
                  {c.action && c.actionLabel && (
                    <a href={c.action} target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "8px", fontSize: "12px", fontWeight: 600, color: "#8B0019", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                      {c.actionLabel}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B15", marginBottom: "14px", letterSpacing: "0.04em" }}>DÚVIDAS FREQUENTES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: "40px", backgroundColor: "#FFF", border: "1px solid #E7E0D5", borderRadius: "20px", padding: "28px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1E1B15", marginBottom: "6px" }}>Não encontrou o que procurava?</div>
          <p style={{ fontSize: "13px", color: "#776D5B", marginBottom: "18px", lineHeight: 1.6 }}>
            Nossa equipe de suporte está disponível para ajudar você com qualquer problema ou dúvida específica.
          </p>
          <a href="mailto:suporte@sga.inst.edu.br"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", borderRadius: "12px", backgroundColor: "#8B0019", color: "#FFF", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#700010")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B0019")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Enviar e-mail para o suporte
          </a>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#E7E0D5", marginTop: "40px" }}>SGA · Sistema de Gestão de Ambientes</p>
      </div>
    </div>
  );
}
