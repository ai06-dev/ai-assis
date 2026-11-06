const { useState, useRef, useEffect } = React;

// 내 PC에서 열면 로컬 서버, 배포 후에는 같은 사이트의 /api/chat
const isLocal = ["127.0.0.1", "localhost"].includes(window.location.hostname);
const API_URL = isLocal ? "http://127.0.0.1:3001/api/chat" : "/api/chat";
const MAX_LENGTH = 2000;

// "오후 2:05" 형식의 시간
function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}

// 말풍선 모양 아이콘
function ChatIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.7 21a.5.5 0 0 0 .75.55L10.6 19c.46.05.93.08 1.4.08 5.5 0 10-3.6 10-8.04S17.5 3 12 3Z"
      />
      <circle cx="8" cy="11" r="1.3" fill="#3c1e1e" />
      <circle cx="12" cy="11" r="1.3" fill="#3c1e1e" />
      <circle cx="16" cy="11" r="1.3" fill="#3c1e1e" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 채팅창 크기 설정
const DEFAULT_SIZE = { w: 380, h: 600 };
const MIN_SIZE = { w: 300, h: 400 };
const SIZE_KEY = "chat-popup-size";

function clampSize({ w, h }) {
  const maxW = Math.max(MIN_SIZE.w, window.innerWidth - 48);
  const maxH = Math.max(MIN_SIZE.h, window.innerHeight - 120);
  return {
    w: Math.round(Math.min(Math.max(w, MIN_SIZE.w), maxW)),
    h: Math.round(Math.min(Math.max(h, MIN_SIZE.h), maxH)),
  };
}

function loadSize() {
  try {
    const saved = JSON.parse(localStorage.getItem(SIZE_KEY));
    if (saved && saved.w && saved.h) return clampSize(saved);
  } catch {}
  return DEFAULT_SIZE;
}

function saveSize(size) {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify(size));
  } catch {}
}

// ───────── 메인 화면: 캡스톤 프로젝트 소개 ─────────
const STEPS = [
  { title: "지식베이스 정리", text: "4회차 실습자료(시방서·검사기준서·작업표준서·계약서)를 AI가 읽을 수 있는 문서 하나로 정리" },
  { title: "AI 연결", text: "Google Gemini에 지식베이스를 함께 보내, 문서 내용에 근거해 답하도록 설정" },
  { title: "채팅 화면", text: "React로 메신저 스타일 채팅창을 만들어 누구나 쉽게 질문" },
  { title: "배포", text: "GitHub에 올리고 Vercel로 배포해 인터넷 주소로 접속" },
];

const DOCS = [
  { tag: "A", name: "기술시방서 Rev.C", text: "라인 구성(ST10~ST60), 택트타임·가동률·양품률 등 성능 요구사항" },
  { tag: "B", name: "출하검사기준서 Rev.2", text: "성능·스테이션·안전·외관 검사 항목과 판정 및 기록 방법" },
  { tag: "C", name: "ST20·ST30 작업표준서 Rev.3", text: "작업 전 점검, 압입·체결 작업 순서, 이상 발생 시 조치" },
  { tag: "D", name: "납품계약서", text: "납기, FAT·SAT 검수, 성능 보증, 지체상금, 하자 보증 등 30개 조항" },
];

const TECH = [
  { name: "React", text: "화면 (CDN 방식, 빌드 도구 없음)" },
  { name: "Node.js", text: "내 PC 테스트용 서버" },
  { name: "Google Gemini", text: "질문에 답하는 AI 모델" },
  { name: "Vercel", text: "인터넷 배포와 API 서버" },
  { name: "GitHub", text: "코드 보관과 버전 관리" },
];

const SAMPLE_QUESTIONS = [
  "ST30 체결 토크 기준이 몇 N·m야?",
  "연속 시운전은 몇 시간이야?",
  "Rev.B에서 Rev.C로 바뀐 내용 알려줘",
  "택트타임 요구 기준은?",
];

function Landing({ onAsk }) {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-inner">
          <span className="badge">캡스톤 프로젝트</span>
          <h1>품질경영실 AI 비서</h1>
          <p className="lead">
            SJ-AL200 자동 조립·검사 라인의 품질 문서를 읽고,<br />
            궁금한 기준을 바로 찾아 답해 주는 사내 AI 비서입니다.
          </p>
          <button type="button" className="hero-btn" onClick={() => onAsk("")}>
            AI 비서에게 물어보기
          </button>
        </div>
      </section>

      <main className="sections">
        <section className="card">
          <h2>프로젝트 목표</h2>
          <ul className="goals">
            <li><strong>찾는 시간 단축</strong> 여러 문서에 흩어진 품질 기준을 질문 한 번으로 확인</li>
            <li><strong>근거 있는 답변</strong> 지식베이스 문서 내용에 근거해서만 답변</li>
            <li><strong>비개발자도 직접 구축</strong> AI 도구와 함께 화면·서버·배포까지 완성</li>
          </ul>
        </section>

        <section className="card">
          <h2>만든 과정</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2>AI가 학습한 문서</h2>
          <div className="doc-grid">
            {DOCS.map((d) => (
              <div className="doc" key={d.tag}>
                <span className="doc-tag">{d.tag}</span>
                <h3>{d.name}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
          <p className="footnote">※ 교육용 가상 자료입니다. 회사명·인명·수치는 실제와 관계없습니다.</p>
        </section>

        <section className="card">
          <h2>사용 기술</h2>
          <div className="tech-list">
            {TECH.map((t) => (
              <div className="tech" key={t.name}>
                <strong>{t.name}</strong>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>이렇게 물어보세요</h2>
          <p className="card-sub">질문을 누르면 채팅창에 바로 입력됩니다.</p>
          <div className="samples">
            {SAMPLE_QUESTIONS.map((q) => (
              <button type="button" className="sample" key={q} onClick={() => onAsk(q)}>
                {q}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        품질경영실 AI 비서 · 캡스톤 프로젝트 · 실습용 화면입니다. 실제 회사 자료나 개인정보를 입력하지 마세요.
      </footer>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  // 메인 화면의 예시 질문을 채팅 입력창에 넣기 위한 값
  const [draft, setDraft] = useState({ text: "", id: 0 });

  function askFromLanding(text) {
    if (text) setDraft((d) => ({ text, id: d.id + 1 }));
    setOpen(true);
  }
  const [size, setSize] = useState(loadSize);
  const [resizing, setResizing] = useState(false);

  // 창은 오른쪽 아래에 붙어 있으므로 위쪽·왼쪽 가장자리를 끌어서 크기를 바꾼다.
  function startResize(e, dir) {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, ...size };
    let latest = size;
    setResizing(true);

    function onMove(ev) {
      latest = clampSize({
        w: dir.includes("left") ? start.w + (start.x - ev.clientX) : start.w,
        h: dir.includes("top") ? start.h + (start.y - ev.clientY) : start.h,
      });
      setSize(latest);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setResizing(false);
      saveSize(latest);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // 모서리를 더블클릭하면 원래 크기로
  function resetSize() {
    setSize(DEFAULT_SIZE);
    saveSize(DEFAULT_SIZE);
  }

  // 브라우저 창이 작아지면 채팅창도 화면 안에 들어오게 줄인다.
  useEffect(() => {
    function onWindowResize() {
      setSize((s) => clampSize(s));
    }
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, []);

  // Esc 키로 채팅창 닫기
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Landing onAsk={askFromLanding} />

      {/* 채팅창은 닫아도 대화 내용이 남도록 화면에서 숨기기만 한다 */}
      <div
        className={`chat-popup ${open ? "open" : ""} ${resizing ? "resizing" : ""}`}
        style={{ "--popup-w": `${size.w}px`, "--popup-h": `${size.h}px` }}
        role="dialog"
        aria-label="품질경영실 AI 비서"
        aria-hidden={!open}
      >
        {/* 크기 조절 손잡이: 위쪽, 왼쪽, 왼쪽 위 모서리 */}
        <div className="resize-handle top" onPointerDown={(e) => startResize(e, "top")} />
        <div className="resize-handle left" onPointerDown={(e) => startResize(e, "left")} />
        <div
          className="resize-handle top-left"
          onPointerDown={(e) => startResize(e, "top-left")}
          onDoubleClick={resetSize}
          title="끌어서 크기 조절 (더블클릭: 원래 크기)"
        />
        <ChatWindow open={open} onClose={() => setOpen(false)} draft={draft} />
      </div>

      <button
        type="button"
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "채팅창 닫기" : "AI 비서 채팅 열기"}
        title={open ? "채팅창 닫기" : "AI 비서에게 물어보기"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}

function ChatWindow({ open, onClose, draft }) {
  // 메시지 형식: { role: "user" | "assistant", text, time, error? }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // 메인 화면에서 예시 질문을 누르면 입력창에 채운다 (전송은 직접)
  useEffect(() => {
    if (draft && draft.text) setInput(draft.text);
  }, [draft]);

  // 새 메시지가 오면 맨 아래로 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  // 채팅창을 열면 입력창에 바로 커서
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", text, time: nowTime() };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);

    // 오류 안내 메시지는 대화 기록으로 보내지 않는다.
    const history = next
      .filter((m) => !m.error)
      .map(({ role, text }) => ({ role, text }));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "답변을 받지 못했습니다. 잠시 후 다시 시도하세요.");
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, time: nowTime() }]);
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인하세요."
          : err.message;
      setMessages((prev) => [...prev, { role: "assistant", text: msg, time: nowTime(), error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Enter = 전송, Shift+Enter = 줄바꿈 (한글 입력 조합 중에는 무시)
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (loading) return;
    setMessages([]);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>품질경영실 AI 비서</h1>
        <div className="header-actions">
          <button
            type="button"
            className="clear-btn"
            onClick={clearChat}
            disabled={loading || messages.length === 0}
          >
            대화 지우기
          </button>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="채팅창 닫기"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <main className="messages" ref={listRef}>
        <div className="date-chip">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric", month: "long", day: "numeric", weekday: "long",
          })}
        </div>

        {messages.length === 0 && (
          <p className="empty">무엇이든 물어보세요.</p>
        )}

        {messages.map((m, i) => (
          <Message key={i} message={m} />
        ))}

        {loading && (
          <Message message={{ role: "assistant", text: "답변 작성 중...", typing: true }} />
        )}
      </main>

      <footer className="composer">
        <div className="input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력 (Shift+Enter: 줄바꿈)"
            rows={2}
            maxLength={MAX_LENGTH}
            aria-label="질문 입력"
          />
          <button
            type="button"
            className="send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            전송
          </button>
        </div>
        <p className="notice">
          실습용 챗봇입니다. 실제 회사 자료나 개인정보를 입력하지 마세요.
        </p>
      </footer>
    </div>
  );
}

function Message({ message: m }) {
  const isUser = m.role === "user";
  const bubbleClass = ["bubble", m.error && "error", m.typing && "typing"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`row ${m.role}`}>
      {!isUser && <div className="avatar" aria-hidden="true">AI</div>}
      <div className="content">
        {!isUser && <div className="name">AI 비서</div>}
        <div className="bubble-line">
          {/* 일반 텍스트로만 표시 (HTML로 해석하지 않음) */}
          <div className={bubbleClass}>{m.text}</div>
          {m.time && <span className="time">{m.time}</span>}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
