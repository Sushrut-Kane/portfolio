/* =============================================================
   Sushrut Kane — Terminal feature (self-contained)
   An authentic Linux TTY layered over the portfolio. It does not
   touch the site's own script.js: it builds its own DOM, locks the
   background scroll while open, and pulls real portfolio data.
   Open with the floating launcher, Ctrl+`  or  the ` key.
   ============================================================= */
(function () {
    "use strict";

    if (window.__skTerminalLoaded) return;
    window.__skTerminalLoaded = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const BOOT_TIME = Date.now();

    /* localStorage wrapper (safe if disabled / private mode) */
    const safeStore = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
        getJSON(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
        setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    };

    /* ---------------------------------------------------------------
       Portfolio data (mirrors index.html — single source of truth here)
    --------------------------------------------------------------- */
    const USER = "sushrut";
    const HOST = "portfolio";
    const LINKS = {
        email: "hello@sushrutkane.dev",
        github: "https://github.com/Sushrut-Kane",
        resume: "https://drive.google.com/file/d/1LAdF9yVdH7Bd3opZ8IN5lMvUbdnBN0Tb/view?usp=sharing",
    };

    const PROJECTS = [
        { id: "skillforge", name: "SkillForge", tags: ["AI", "Full-Stack"], url: "https://github.com/Sushrut-Kane/SkillForge", desc: "AI-driven platform that helps you forge new skills with guided, personalised paths." },
        { id: "chat-with-pdf", name: "Chat with PDF", tags: ["LLM", "RAG"], url: "https://sushrut-kane-chatwithpdf-ufyy7lxmyfzrqngbwbrfwu.streamlit.app/", desc: "Ask questions across any PDF using retrieval-augmented generation." },
        { id: "ats-resume-tracker", name: "ATS Resume Tracker", tags: ["LLM", "Prompt Eng"], url: "https://atsresumetracker-d3khybmfx4pwrdpzc2645o.streamlit.app/", desc: "Scores a résumé against a job description the way a real ATS would." },
        { id: "agri-advisor", name: "Agri-Advisor", tags: ["MERN", "Full-Stack"], url: "https://github.com/Sushrut-Kane/Agri", desc: "MERN app serving data-driven crop and farming advice." },
        { id: "recipe-finder", name: "Recipe Finder", tags: ["Frontend", "API"], url: "https://recipe-finder-eta-green.vercel.app/", desc: "Find recipes by ingredient through a clean, API-driven UI." },
    ];

    const SKILLS = [
        ["Machine Learning & AI", "TensorFlow · PyTorch · scikit-learn · Pandas · NumPy · NLP · Prompt Engineering"],
        ["Web Development", "React · Node.js · Express · REST APIs · Streamlit · HTML / CSS"],
        ["Languages & CS", "Python · JavaScript · C · MATLAB · Data Structures · Algorithms"],
        ["Tools & Workflow", "Git · GitHub · Vercel · Jupyter · VS Code · Linux"],
    ];

    const EXPERIENCE = [
        { role: "Software Engineering Intern", org: "Philips", place: "Bangalore, India", period: "2026 — Present", now: true, desc: "Contributing to software development at one of the world's largest health-technology companies — shipping work that lands in real products." },
        { role: "Research Intern", org: "RRCAT", place: "Indore, India", period: "Earlier", now: false, desc: "Raja Ramanna Centre for Advanced Technology (Dept. of Atomic Energy) — hands-on research-grade engineering in a national R&D lab." },
    ];

    const ABOUT = [
        "Third-year Computer Science student at Manipal University Jaipur, working",
        "across full-stack development, machine learning and NLP. I like turning",
        "messy problems into software people actually enjoy using.",
        "",
        "Off the screen: competitive table-tennis & hockey player, and an incurable",
        "traveller — every new place tends to reset how I look at a problem.",
    ];

    const FACTS = [
        ["Based in", "Jaipur, India"],
        ["Focus", "Full-stack · ML · NLP"],
        ["Education", "B.Tech CS — MUJ, Year 3"],
        ["Currently", "Intern @ Philips, Bangalore"],
        ["Shipped", "5 live projects & counting"],
        ["Speaks", "English · Hindi · Marathi"],
    ];

    /* Dev wisdom for `fortune` (and `fortune | cowsay`). */
    const FORTUNES = [
        "Talk is cheap. Show me the code. — Linus Torvalds",
        "First, solve the problem. Then, write the code. — John Johnson",
        "Programs must be written for people to read. — Abelson & Sussman",
        "Simplicity is the soul of efficiency. — Austin Freeman",
        "Make it work, make it right, make it fast. — Kent Beck",
        "The best error message is the one that never shows up. — Thomas Fuchs",
        "Weeks of coding can save you hours of planning.",
        "It works on my machine. — Every developer, at least once",
        "Good programmers write code humans can understand.",
        "Ship it — then make it better.",
    ];

    /* Built-in assistant answers for `ask`. First keyword hit wins. */
    const ASK_DEFAULT = [
        "I can talk about skills, projects, experience, education,",
        "availability, or how to get in touch.",
        "Try:  ask what are you best at   ·   ask are you open to work",
    ];
    // Order matters: the first intent whose keyword appears in the query wins,
    // so more specific intents (why / availability) sit above generic ones.
    const ASK = [
        {
            k: ["hello", "hey ", " hi ", "howdy", "greetings", " yo "],
            a: ["Hey — I'm Sushrut's terminal assistant.",
                "Ask me about his skills, projects, experience, or whether",
                "he's open to work.  e.g.  ask what's your tech stack"],
        },
        {
            k: ["why", "stand out", "pick you", "choose you", "should i", "why should"],
            a: ["Because I ship. 5 live projects, real internships (Philips, RRCAT),",
                "and I move comfortably from ML model to deployed full-stack app.",
                "Curious, fast, and I sweat the details."],
        },
        {
            k: ["hire", "available", "availab", "open to", "opening", "opportunit", "recruit", "freelance", "looking", "vacan", "work with you", "work for you"],
            a: ["Yes — open to internships and genuinely interesting roles.",
                "Fastest way in: email  " + LINKS.email,
                "or run  contact  for every link."],
        },
        {
            k: ["experience", "work experience", "worked", "intern", "philips", "rrcat", " job", "career", "company", "companies"],
            a: ["Currently a Software Engineering Intern at Philips, Bangalore —",
                "shipping work inside real products. Previously a Research Intern",
                "at RRCAT (Dept. of Atomic Energy). Run  experience  for more."],
        },
        {
            k: ["education", "study", "college", "university", "muj", "manipal", "degree", "student"],
            a: ["3rd-year B.Tech in Computer Science at Manipal University Jaipur,",
                "focused on full-stack, machine learning and NLP. Run  education."],
        },
        {
            k: ["best", "good at", "strength", "great at", "skill", "expert", "tech stack", "stack"],
            a: ["Strongest in Python, machine-learning / NLP and full-stack",
                "web (React · Node · Express). Comfortable end-to-end: model",
                "in a notebook → API → deployed app. Run  skills  for the list."],
        },
        {
            k: ["machine learning", " ml", " ai", "nlp", "model", "data science", "deep learning"],
            a: ["ML/NLP is home turf: TensorFlow, PyTorch, scikit-learn, Pandas,",
                "NumPy and prompt engineering. Shipped RAG (Chat with PDF) and an",
                "ATS résumé scorer. Run  projects  to see them live."],
        },
        {
            k: ["web", "frontend", "front-end", "full stack", "full-stack", "react", "node", "backend", "mern"],
            a: ["Full-stack with React, Node, Express and REST APIs — plus",
                "Streamlit for fast ML front-ends. Agri-Advisor is a full MERN",
                "build. Run  projects  for links."],
        },
        {
            k: ["project", "portfolio", "your work", "built", "ship", "made", " app", "demo", "work"],
            a: ["5 live projects: SkillForge, Chat with PDF, ATS Resume Tracker,",
                "Agri-Advisor and Recipe Finder.",
                "Run  projects  for details, or  open skillforge  to launch one."],
        },
        {
            k: ["contact", "reach", "email", "connect", "touch", "message", " dm"],
            a: ["Email : " + LINKS.email,
            "GitHub: " + LINKS.github,
                "Or just run  contact ."],
        },
        {
            k: ["fun", "hobby", "hobbies", "free time", "outside", "sport", "travel", "life"],
            a: ["Off-screen: competitive table-tennis and hockey, plus a serious",
                "travel habit — new places tend to reset how I look at a problem."],
        },
        {
            k: ["where", "based", "location", "live", "from", "city", "country"],
            a: ["Based in Jaipur, India — currently interning at Philips, Bangalore."],
        },
        {
            k: ["learn", "currently", "next", "growing"],
            a: ["Right now: going deeper on ML/NLP and shipping full-stack side",
                "projects to keep the theory honest."],
        },
    ];

    /* `sl` — the classic steam locomotive, for when you mistype `ls`. */
    const TRAIN = [
        "      ====        ________                ___________",
        "  _D _|  |_______/        \\__I_I_____===__|_________|",
        "   |(_)---  |   H\\________/ |   |        =|___ ___|  ",
        "   /     |  |   H  |  |     |   |         ||_| |_||  ",
        "  |      |  |   H  |__--------------------| [___] |  ",
        "  | ________|___H__/__|_____/[][]~\\_______|       |  ",
        "  |/ |   |-----------I_____I [][] []  D   |=======|__",
        "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
        " |/-=|___|=    ||    ||    ||    |_____/~\\___/       ",
        "  \\_/      \\O=====O=====O=====O_/      \\_/           ",
    ];

    /* Manual pages for `man <cmd>`. */
    const MAN = {
        ask: { s: "ask <question>", d: ["Ask the built-in assistant about skills, projects,", "experience, availability, education and more."] },
        about: { s: "about", d: ["Print a short bio and quick facts."] },
        projects: { s: "projects [name]", d: ["List projects, or open one by name (e.g. projects skillforge)."] },
        open: { s: "open <target>", d: ["Open a project, résumé or GitHub in a new tab."] },
        ls: { s: "ls [-a] [path]", d: ["List directory contents. -a includes hidden files."] },
        cd: { s: "cd [path]", d: ["Change directory. No argument returns home (~)."] },
        cat: { s: "cat <file>", d: ["Print a file's contents to the screen."] },
        tree: { s: "tree", d: ["Show the whole filesystem as a tree."] },
        cowsay: { s: "cowsay [text]", d: ["An ASCII cow says whatever you tell it.", "Pairs nicely:  fortune | cowsay"] },
        fortune: { s: "fortune", d: ["Print a random piece of developer wisdom."] },
        theme: { s: "theme [name]", d: ["Switch colours: green, amber, matrix, tokyo, paper."] },
        matrix: { s: "matrix", d: ["Toggle the digital rain. Esc or click to exit."] },
        neofetch: { s: "neofetch", d: ["Show system info beside the mascot."] },
        sl: { s: "sl", d: ["You have mistyped 'ls'. Enjoy the consequences."] },
    };

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /* Tux — colored with the active accent */
    const TUX = [
        "        a8888b.",
        "       d888888b.",
        "       8P\"YP\"Y88",
        "       8|o||o|88",
        "       8'    .88",
        "       8`._.' Y8.",
        "      d/      `8b.",
        "     d8'   .   `8b.",
        "    d8'     '     `8b.",
        "   d8'       '      `8b.",
        "  :88.        '       .88:",
        "  :888        '       888:",
        "   Y88b.     '     .d88P",
        "    `Y888b.'   '.d888P'",
        "      `Y8888888888P'",
        "         `Y8888P'",
    ];

    const BANNER = [
        "███████╗██╗   ██╗███████╗██╗  ██╗██████╗ ██╗   ██╗████████╗",
        "██╔════╝██║   ██║██╔════╝██║  ██║██╔══██╗██║   ██║╚══██╔══╝",
        "███████╗██║   ██║███████╗███████║██████╔╝██║   ██║   ██║   ",
        "╚════██║██║   ██║╚════██║██╔══██║██╔══██╗██║   ██║   ██║   ",
        "███████║╚██████╔╝███████║██║  ██║██║  ██║╚██████╔╝   ██║   ",
        "╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ",
    ];

    /* ---------------------------------------------------------------
       Small safe DOM helpers (never innerHTML with dynamic content)
    --------------------------------------------------------------- */
    const make = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    };
    const span = (text, cls) => make("span", cls, text);

    function safeOpen(url) {
        if (typeof url !== "string") return;
        if (/^(https?:|mailto:)/i.test(url)) window.open(url, "_blank", "noopener");
    }

    function link(text, url) {
        const a = make("a", "sk-term-link", text);
        if (/^(https?:|mailto:)/i.test(url)) {
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener";
        } else {
            a.href = "#";
            a.addEventListener("click", (e) => e.preventDefault());
        }
        return a;
    }

    // Turn a plain string into text + clickable links (URLs and emails).
    const URL_RE = /(https?:\/\/[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
    function linkify(text) {
        const frag = document.createDocumentFragment();
        let last = 0, m;
        URL_RE.lastIndex = 0;
        while ((m = URL_RE.exec(text)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
            const token = m[0];
            const url = token.includes("@") && !token.startsWith("http") ? "mailto:" + token : token;
            frag.appendChild(link(token, url));
            last = m.index + token.length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        return frag;
    }

    /* ---------------------------------------------------------------
       Build the DOM: launcher + overlay + window
    --------------------------------------------------------------- */
    const launcher = make("button", "sk-term-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open terminal");
    launcher.append(
        span(">_", "sk-term-launcher__glyph"),
        span("terminal"),
        span("", "sk-term-launcher__blink"),
        (() => { const k = span("Ctrl `", "sk-term-launcher__kbd"); return k; })()
    );

    const overlay = make("div", "sk-term-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Interactive terminal — Sushrut Kane");

    const win = make("div", "sk-term-win");
    const savedTheme = safeStore.get("sk-term-theme");
    win.dataset.theme = ["green", "amber", "matrix", "tokyo", "paper"].includes(savedTheme) ? savedTheme : "green";
    win.dataset.scan = safeStore.get("sk-term-scan") === "off" ? "off" : "on";

    // Title bar
    const titlebar = make("div", "sk-term-titlebar");
    const dots = make("div", "sk-term-dots");
    const dotClose = make("button", "sk-term-dot sk-term-dot--close");
    dotClose.type = "button"; dotClose.setAttribute("aria-label", "Close terminal"); dotClose.append(span("✕"));
    const dotMin = make("button", "sk-term-dot sk-term-dot--min");
    dotMin.type = "button"; dotMin.setAttribute("aria-label", "Minimise terminal"); dotMin.append(span("—"));
    const dotMax = make("button", "sk-term-dot sk-term-dot--max");
    dotMax.type = "button"; dotMax.setAttribute("aria-label", "Maximise terminal"); dotMax.append(span("+"));
    dots.append(dotClose, dotMin, dotMax);

    const title = make("div", "sk-term-title");
    title.append(document.createTextNode(USER + "@" + HOST + ": "), (() => { const b = make("b", null, "~"); return b; })());

    const tools = make("div", "sk-term-tools");
    const btnTheme = make("button", "sk-term-toolbtn", "◐");
    btnTheme.type = "button"; btnTheme.title = "Cycle theme"; btnTheme.setAttribute("aria-label", "Cycle colour theme");
    const btnScan = make("button", "sk-term-toolbtn", "▤");
    btnScan.type = "button"; btnScan.title = "Toggle CRT scanlines"; btnScan.setAttribute("aria-label", "Toggle scanlines");
    tools.append(btnTheme, btnScan);

    titlebar.append(dots, title, tools);

    // Screen
    const screen = make("div", "sk-term-screen");
    const body = make("div", "sk-term-body");
    const output = make("div", "sk-term-output");
    const scan = make("div", "sk-term-scan");

    // Input line
    const inputLine = make("div", "sk-term-inputline");
    const promptSpan = make("span", "sk-term-prompt");
    const cmdwrap = make("span", "sk-term-cmdwrap");
    const render = make("span", "sk-term-render");
    const preSpan = make("span");
    const cursor = make("span", "sk-term-cursor");
    const postSpan = make("span");
    render.append(preSpan, cursor, postSpan);
    const capture = make("input", "sk-term-capture");
    capture.type = "text";
    capture.setAttribute("autocomplete", "off");
    capture.setAttribute("autocapitalize", "off");
    capture.setAttribute("autocorrect", "off");
    capture.setAttribute("spellcheck", "false");
    capture.setAttribute("aria-label", "Terminal input");
    cmdwrap.append(render, capture);
    inputLine.append(promptSpan, cmdwrap);

    // Matrix canvas
    const matrixCanvas = make("canvas", "sk-term-matrix");

    body.append(output, inputLine);
    screen.append(body, scan, matrixCanvas);
    win.append(titlebar, screen);
    overlay.append(win);

    /* ---------------------------------------------------------------
       Virtual filesystem
    --------------------------------------------------------------- */
    const file = (content, meta) => ({ type: "file", content, ...meta });
    const dir = (children) => ({ type: "dir", children });

    const projectsDir = {};
    PROJECTS.forEach((p) => {
        projectsDir[p.id + ".md"] = file(
            `# ${p.name}\n${p.desc}\nStack: ${p.tags.join(", ")}\nLive: ${p.url}\n`,
            { open: p.url }
        );
    });

    const VFS = {
        "~": dir({
            "about.txt": file(ABOUT.join("\n") + "\n"),
            "skills.txt": file(SKILLS.map(([k, v]) => `${k}:\n  ${v}`).join("\n\n") + "\n"),
            "experience.log": file(EXPERIENCE.map((e) => `[${e.period}] ${e.role} — ${e.org} (${e.place})\n  ${e.desc}`).join("\n\n") + "\n"),
            "contact.md": file(`# Contact\nEmail : ${LINKS.email}\nGitHub: ${LINKS.github}\nResume: ${LINKS.resume}\n`),
            "resume.pdf": file("Binary file — run `resume` (or `open resume`) to view.\n", { open: LINKS.resume }),
            "projects": dir(projectsDir),
            ".secret": file("You found it. The real secret: ship things, stay curious, be kind.\n"),
        }),
    };

    let cwd = ["~"]; // path stack

    function nodeAt(pathArr) {
        let node = VFS["~"];
        if (pathArr.length === 0 || pathArr[0] !== "~") return null;
        for (let i = 1; i < pathArr.length; i++) {
            if (node.type !== "dir" || !node.children[pathArr[i]]) return null;
            node = node.children[pathArr[i]];
        }
        return node;
    }

    // Resolve a path string (relative or ~-absolute) to a path array.
    function resolvePath(input) {
        let base = input.startsWith("~") ? ["~"] : cwd.slice();
        const parts = input.replace(/^~\/?/, "").split("/").filter(Boolean);
        for (const part of parts) {
            if (part === ".") continue;
            if (part === "..") { if (base.length > 1) base.pop(); continue; }
            base.push(part);
        }
        return base;
    }

    const pathDisplay = (arr = cwd) => arr.join("/");
    const pathAbsolute = (arr = cwd) => "/home/" + USER + (arr.length > 1 ? "/" + arr.slice(1).join("/") : "");

    /* ---------------------------------------------------------------
       Writing to the screen
    --------------------------------------------------------------- */
    function scrollDown() { body.scrollTop = body.scrollHeight; }

    function writeLine(...children) {
        const line = make("div", "sk-term-line");
        children.forEach((c) => line.append(typeof c === "string" ? document.createTextNode(c) : c));
        output.append(line);
        return line;
    }
    function writeText(text, cls) {
        String(text).split("\n").forEach((ln) => {
            const line = make("div", "sk-term-line", null);
            if (cls) line.className += " " + cls;
            line.append(linkify(ln));
            output.append(line);
        });
    }
    const blank = () => output.append(make("div", "sk-term-line", "\u00A0"));

    /* ---------------------------------------------------------------
       Prompt + custom line editor (block cursor, bash shortcuts)
    --------------------------------------------------------------- */
    function buildPrompt() {
        return [
            span(USER, "t-user"), span("@"), span(HOST, "t-user"),
            span(":"), span(pathDisplay(), "t-path"), span("$\u00A0"),
        ];
    }
    function updatePrompt() {
        promptSpan.replaceChildren(...buildPrompt());
        // keep window title in sync with cwd
        title.replaceChildren(document.createTextNode(USER + "@" + HOST + ": "), (() => { const b = make("b", null, pathDisplay()); return b; })());
    }

    function renderInput() {
        const v = capture.value;
        const pos = capture.selectionStart == null ? v.length : capture.selectionStart;
        preSpan.textContent = v.slice(0, pos);
        cursor.textContent = v.slice(pos, pos + 1) || "\u00A0";
        postSpan.textContent = v.slice(pos + 1);
    }
    function setValue(v, caret) {
        capture.value = v;
        const c = caret == null ? v.length : caret;
        try { capture.setSelectionRange(c, c); } catch (e) { /* detached */ }
        renderInput();
    }
    function focusInput() {
        if (!isOpen) return;
        capture.focus({ preventScroll: true });
        win.classList.remove("is-blurred");
    }

    /* ---------------------------------------------------------------
       History
    --------------------------------------------------------------- */
    let history = safeStore.getJSON("sk-term-history") || [];
    let histPos = history.length;
    let stash = "";

    function pushHistory(cmd) {
        if (cmd && history[history.length - 1] !== cmd) {
            history.push(cmd);
            if (history.length > 100) history = history.slice(-100);
            safeStore.setJSON("sk-term-history", history);
        }
        histPos = history.length;
        stash = "";
    }
    function historyPrev() {
        if (!history.length) return;
        if (histPos === history.length) stash = capture.value;
        if (histPos > 0) histPos--;
        setValue(history[histPos]);
    }
    function historyNext() {
        if (histPos >= history.length) return;
        histPos++;
        setValue(histPos === history.length ? stash : history[histPos]);
    }

    /* ---------------------------------------------------------------
       Tab completion (commands, then filesystem paths)
    --------------------------------------------------------------- */
    function completionsFor(token, kind) {
        if (kind === "cmd") {
            return Object.keys(COMMANDS).filter((c) => c.startsWith(token)).sort();
        }
        // path completion inside cwd (or a partial subdir)
        const slash = token.lastIndexOf("/");
        const dirPart = slash >= 0 ? token.slice(0, slash + 1) : "";
        const frag = slash >= 0 ? token.slice(slash + 1) : token;
        const baseNode = nodeAt(resolvePath(dirPart || "."));
        if (!baseNode || baseNode.type !== "dir") return [];
        return Object.keys(baseNode.children)
            .filter((n) => n.startsWith(frag) && (frag.startsWith(".") || !n.startsWith(".")))
            .map((n) => dirPart + n + (baseNode.children[n].type === "dir" ? "/" : ""))
            .sort();
    }

    function complete() {
        const v = capture.value;
        const upto = v.slice(0, capture.selectionStart);
        const parts = upto.split(/\s+/);
        const isCmd = parts.length <= 1;
        const token = parts[parts.length - 1];
        const matches = completionsFor(token, isCmd ? "cmd" : "path");
        if (matches.length === 0) return;
        if (matches.length === 1) {
            const completed = matches[0];
            const before = upto.slice(0, upto.length - token.length);
            const after = completed.endsWith("/") ? "" : " ";
            setValue(before + completed + after + v.slice(capture.selectionStart));
            return;
        }
        // common prefix
        let prefix = matches[0];
        for (const m of matches) { while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1); }
        if (prefix.length > token.length) {
            const before = upto.slice(0, upto.length - token.length);
            setValue(before + prefix + v.slice(capture.selectionStart));
        } else {
            echoCommand(capture.value);
            const wrap = make("div", "sk-term-line t-dim");
            wrap.textContent = matches.map((m) => m.replace(/\/$/, "/")).join("    ");
            output.append(wrap);
            scrollDown();
        }
    }

    /* ---------------------------------------------------------------
       Command execution
    --------------------------------------------------------------- */
    function echoCommand(text) {
        const line = make("div", "sk-term-line sk-term-echo");
        line.append(...buildPrompt(), span(text));
        output.append(line);
    }

    function run(raw) {
        const line = raw.trim();
        echoCommand(raw);
        if (line) {
            if (line.includes("|")) {
                handlePipe(line);
            } else {
                const parts = line.split(/\s+/);
                const cmd = parts[0].toLowerCase();
                const args = parts.slice(1);
                const fn = COMMANDS[cmd] || ALIASES[cmd];
                if (fn) {
                    try { fn(args, cmd); }
                    catch (e) { writeText("sush: internal error running '" + cmd + "'", "t-err"); }
                } else {
                    writeLine(span("sush: command not found: " + cmd, "t-err"));
                    writeLine(span("Type ", "t-dim"), span("help", "t-accent"), span(" to see everything I can do.", "t-dim"));
                }
            }
        }
        pushHistory(line);
        updatePrompt();
        setValue("");
        scrollDown();
    }

    /* ---------------------------------------------------------------
       Command implementations
    --------------------------------------------------------------- */
    function cmdHelp() {
        writeLine(span("Available commands", "t-accent2 t-b"));
        blank();
        const groups = [
            ["about", "Who I am"],
            ["whoami", "Short version"],
            ["ask <q>", "Ask my built-in assistant"],
            ["skills", "Technical capabilities"],
            ["projects", "Selected work (with live links)"],
            ["experience", "Where I've worked"],
            ["education", "Studies"],
            ["contact", "How to reach me"],
            ["resume", "Open my résumé"],
            ["github", "Open my GitHub"],
            ["neofetch", "System info + logo"],
            ["ls / cd / cat", "Explore the filesystem"],
            ["pwd / tree", "Where am I / full tree"],
            ["theme", "Switch colours (green/amber/matrix/tokyo/paper)"],
            ["matrix", "Enter the matrix"],
            ["banner", "Big ASCII name"],
            ["fortune | cowsay", "Dev wisdom, spoken by a cow"],
            ["man <cmd>", "Manual pages"],
            ["date / uptime", "Time in IST / session uptime"],
            ["history", "Command history"],
            ["clear", "Clear the screen"],
            ["exit", "Close the terminal"],
        ];
        const dl = make("dl", "sk-term-cmds");
        groups.forEach(([k, v]) => { dl.append(make("dt", null, k), make("dd", null, v)); });
        output.append(dl);
        writeLine(span("Tips: ", "t-dim"), span("Tab", "t-accent"), span(" completes · ", "t-dim"), span("↑ ↓", "t-accent"), span(" history · ", "t-dim"), span("Ctrl+L", "t-accent"), span(" clear · ", "t-dim"), span("Esc", "t-accent"), span(" close", "t-dim"));
    }

    function cmdAbout() {
        writeLine(span("Sushrut Kane", "t-accent2 t-b"), span(" — Developer & ML Engineer", "t-dim"));
        blank();
        ABOUT.forEach((l) => writeText(l || "\u00A0"));
        blank();
        const dl = make("dl", "sk-term-cmds");
        FACTS.forEach(([k, v]) => { dl.append(make("dt", null, k), make("dd", null, v)); });
        output.append(dl);
    }

    function cmdWhoami() {
        writeText(USER);
        writeLine(span("Third-year CS @ MUJ · building full-stack + ML · currently interning @ Philips.", "t-dim"));
    }

    function cmdSkills() {
        writeLine(span("Capabilities", "t-accent2 t-b"));
        blank();
        SKILLS.forEach(([k, v], i) => {
            writeLine(span(String(i + 1).padStart(2, "0") + "  ", "t-dim"), span(k, "t-accent"));
            writeLine(span("     " + v, "t-dim"));
        });
    }

    function cmdProjects(args) {
        if (args[0]) return openTarget(args[0]);
        writeLine(span("Selected work", "t-accent2 t-b"), span("  —  " + PROJECTS.length + " live", "t-dim"));
        blank();
        PROJECTS.forEach((p, i) => {
            const card = make("div", "sk-term-proj");
            const top = make("div", "sk-term-proj__top");
            top.append(
                (() => { const s = make("span"); s.append(span(String(i + 1).padStart(2, "0") + "  ", "t-dim"), span(p.name, "sk-term-proj__name")); return s; })(),
                span("[ " + p.tags.join(" · ") + " ]", "sk-term-proj__tags")
            );
            const desc = make("div", null, p.desc);
            const url = make("div");
            url.append(span("→ ", "t-dim"), link(p.url, p.url));
            card.append(top, desc, url);
            output.append(card);
        });
        writeLine(span("Run ", "t-dim"), span("open <name>", "t-accent"), span(" to launch one — e.g. ", "t-dim"), span("open skillforge", "t-accent"));
    }

    function cmdExperience() {
        writeLine(span("Experience", "t-accent2 t-b"));
        blank();
        EXPERIENCE.forEach((e) => {
            const head = make("div", "sk-term-line");
            head.append(span(e.period + "  ", "t-accent"), span(e.role + " ", "t-b"), span("— " + e.org, "t-accent2"));
            output.append(head);
            writeLine(span("  " + e.place + (e.now ? "   ● now" : ""), "t-dim"));
            writeText("  " + e.desc);
            blank();
        });
    }

    function cmdEducation() {
        writeLine(span("Education", "t-accent2 t-b"));
        blank();
        writeLine(span("B.Tech, Computer Science", "t-b"));
        writeLine(span("Manipal University Jaipur — Year 3 (current)", "t-dim"));
        blank();
        writeText("Focus: full-stack development, machine learning and natural language processing.");
    }

    function cmdContact() {
        writeLine(span("Get in touch", "t-accent2 t-b"));
        blank();
        writeLine(span("Email  : ", "t-accent"), link(LINKS.email, "mailto:" + LINKS.email));
        writeLine(span("GitHub : ", "t-accent"), link(LINKS.github, LINKS.github));
        writeLine(span("Résumé : ", "t-accent"), link(LINKS.resume, LINKS.resume));
        blank();
        writeLine(span("Have an idea, a role, or just want to say hi? ", "t-dim"), span("↑", "t-accent"));
    }

    function openTarget(nameRaw) {
        const name = (nameRaw || "").toLowerCase();
        if (name === "resume" || name === "cv") { writeText("Opening résumé…", "t-ok"); return safeOpen(LINKS.resume); }
        if (name === "github") { writeText("Opening GitHub…", "t-ok"); return safeOpen(LINKS.github); }
        if (name === "email" || name === "mail") { writeText("Opening mail client…", "t-ok"); return safeOpen("mailto:" + LINKS.email); }
        const p = PROJECTS.find((x) => x.id === name || x.name.toLowerCase() === name || x.name.toLowerCase().replace(/\s+/g, "") === name.replace(/\s+/g, ""));
        if (p) { writeText("Opening " + p.name + "…", "t-ok"); return safeOpen(p.url); }
        writeLine(span("open: nothing called '" + nameRaw + "'. Try: ", "t-err"), span("resume, github, " + PROJECTS.map((x) => x.id).join(", "), "t-dim"));
    }

    function cmdResume() { writeText("Opening résumé in a new tab…", "t-ok"); safeOpen(LINKS.resume); }
    function cmdGithub() { writeText("Opening GitHub in a new tab…", "t-ok"); safeOpen(LINKS.github); }

    function cmdLs(args) {
        const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
        const target = args.find((a) => !a.startsWith("-"));
        const node = nodeAt(target ? resolvePath(target) : cwd);
        if (!node) return writeText("ls: cannot access '" + target + "': No such file or directory", "t-err");
        if (node.type === "file") return writeText(target);
        const names = Object.keys(node.children).filter((n) => showAll || !n.startsWith("."));
        if (!names.length) return;
        const row = make("div", "sk-term-line");
        names.sort().forEach((n, i) => {
            const isDir = node.children[n].type === "dir";
            row.append(span(n + (isDir ? "/" : ""), isDir ? "t-path t-b" : ""));
            if (i < names.length - 1) row.append(span("    "));
        });
        output.append(row);
    }

    function cmdCd(args) {
        const target = args[0];
        if (!target || target === "~") { cwd = ["~"]; return; }
        const next = resolvePath(target);
        const node = nodeAt(next);
        if (!node) return writeText("cd: no such file or directory: " + target, "t-err");
        if (node.type !== "dir") return writeText("cd: not a directory: " + target, "t-err");
        cwd = next;
    }

    function cmdCat(args) {
        if (!args.length) return writeText("usage: cat <file>", "t-warn");
        args.forEach((a) => {
            const node = nodeAt(resolvePath(a));
            if (!node) return writeText("cat: " + a + ": No such file or directory", "t-err");
            if (node.type === "dir") return writeText("cat: " + a + ": Is a directory", "t-err");
            writeText(typeof node.content === "function" ? node.content() : node.content);
            if (node.open) writeLine(span("→ ", "t-dim"), link(node.open, node.open));
        });
    }

    function cmdPwd() { writeText(pathAbsolute()); }

    function cmdTree() {
        const root = VFS["~"];
        writeLine(span("~", "t-path t-b"));
        const walk = (node, prefix) => {
            const entries = Object.keys(node.children).filter((n) => !n.startsWith("."));
            entries.forEach((name, i) => {
                const last = i === entries.length - 1;
                const child = node.children[name];
                const isDir = child.type === "dir";
                writeLine(span(prefix + (last ? "└── " : "├── "), "t-dim"), span(name + (isDir ? "/" : ""), isDir ? "t-path" : ""));
                if (isDir) walk(child, prefix + (last ? "    " : "│   "));
            });
        };
        walk(root, "");
    }

    function cmdEcho(args) { writeText(args.join(" ")); }

    function cmdDate() {
        const now = new Date();
        let s;
        try {
            s = now.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
        } catch (e) { s = now.toString(); }
        writeText(s + " IST");
    }

    function cmdUptime() {
        const secs = Math.floor((Date.now() - BOOT_TIME) / 1000);
        const m = Math.floor(secs / 60), s = secs % 60;
        writeText("up " + (m ? m + " min " : "") + s + " sec  ·  load average: curiosity, caffeine, code");
    }

    function cmdHistory() {
        if (!history.length) return writeText("(no history yet)", "t-dim");
        history.forEach((h, i) => writeLine(span(String(i + 1).padStart(4, " ") + "  ", "t-dim"), span(h)));
    }

    function cmdUname(args) {
        if (args.includes("-a")) return writeText("SushrutOS 3.0 portfolio 6.tt-hockey-generic #1 SMP x86_64 GNU/Curiosity");
        writeText("SushrutOS");
    }

    function cmdBanner() {
        const pre = make("pre", "sk-term-art");
        pre.textContent = BANNER.join("\n");
        output.append(pre);
        writeLine(span("Developer & ML Engineer · Jaipur, IN", "t-dim"));
    }

    function cmdTheme(args) {
        const themes = ["green", "amber", "matrix", "tokyo", "paper"];
        const t = (args[0] || "").toLowerCase();
        if (!t || t === "list") {
            writeLine(span("Themes: ", "t-dim"), span(themes.join("  "), "t-accent"));
            writeLine(span("Current: ", "t-dim"), span(win.dataset.theme, "t-accent2"));
            writeLine(span("Usage: ", "t-dim"), span("theme tokyo", "t-accent"));
            return;
        }
        if (!themes.includes(t)) return writeText("theme: unknown '" + t + "'. Try: " + themes.join(", "), "t-err");
        win.dataset.theme = t;
        safeStore.set("sk-term-theme", t);
        writeLine(span("Theme → ", "t-dim"), span(t, "t-accent2"));
    }

    function cmdScan() {
        const on = win.dataset.scan !== "off";
        win.dataset.scan = on ? "off" : "on";
        safeStore.set("sk-term-scan", win.dataset.scan);
        writeText("CRT scanlines " + (on ? "off" : "on"), "t-ok");
    }

    function cmdSudo(args) {
        const rest = args.join(" ");
        if (/rm\s+-rf/.test(rest)) {
            writeText("Nice try. This portfolio is protected by good intentions. 🛡", "t-warn");
            return;
        }
        writeText(USER + " is not in the sudoers file. This incident will be reported. 😏", "t-err");
    }

    function cmdVim() { writeText("vim launched. (Just kidding — you can leave. Press any key.)  :q!", "t-warn"); }
    function cmdCoffee() { writeText("☕ Brewing… done. Productivity +40%.", "t-ok"); }

    /* ----- cowsay / fortune / minimal pipes ----- */
    function cowsayText(text) {
        let msg = (text == null ? "" : String(text)).replace(/\t/g, "    ").trim();
        if (!msg) msg = "Moo!";
        const words = msg.split(/\s+/);
        const lines = [];
        let cur = "";
        words.forEach((w) => {
            if ((cur + " " + w).trim().length > 38) { if (cur) lines.push(cur); cur = w; }
            else cur = (cur + " " + w).trim();
        });
        if (cur) lines.push(cur);
        const width = lines.reduce((m, l) => Math.max(m, l.length), 0);
        const out = [" " + "_".repeat(width + 2)];
        if (lines.length === 1) {
            out.push("< " + lines[0].padEnd(width) + " >");
        } else {
            lines.forEach((l, i) => {
                const lb = i === 0 ? "/" : i === lines.length - 1 ? "\\" : "|";
                const rb = i === 0 ? "\\" : i === lines.length - 1 ? "/" : "|";
                out.push(lb + " " + l.padEnd(width) + " " + rb);
            });
        }
        out.push(" " + "-".repeat(width + 2));
        out.push("        \\   ^__^");
        out.push("         \\  (oo)\\_______");
        out.push("            (__)\\       )\\/\\");
        out.push("                ||----w |");
        out.push("                ||     ||");
        return out.join("\n");
    }

    function cmdCowsay(args) {
        const pre = make("pre", "sk-term-art");
        pre.textContent = cowsayText(args.join(" "));
        output.append(pre);
    }

    function cmdFortune() { writeText(pick(FORTUNES)); }

    // Only pure text commands can be piped (echo, fortune, cowsay).
    const TEXT_PRODUCERS = {
        echo: (args) => args.join(" "),
        fortune: () => pick(FORTUNES),
        cowsay: (args, stdin) => cowsayText(stdin != null ? stdin : args.join(" ")),
    };
    const PIPE_ART = new Set(["cowsay"]);

    function handlePipe(line) {
        const segs = line.split("|").map((s) => s.trim()).filter(Boolean);
        let stdin = null, lastCmd = "";
        for (const seg of segs) {
            const parts = seg.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const fn = TEXT_PRODUCERS[cmd];
            if (!fn) {
                writeLine(span("sush: ", "t-err"), span("pipe supports only ", "t-dim"), span("echo, fortune, cowsay", "t-accent"));
                return;
            }
            stdin = fn(parts.slice(1), stdin);
            lastCmd = cmd;
        }
        if (PIPE_ART.has(lastCmd)) {
            const pre = make("pre", "sk-term-art");
            pre.textContent = stdin;
            output.append(pre);
        } else {
            writeText(stdin == null ? "" : String(stdin));
        }
    }

    /* ----- ask: a tiny built-in assistant ----- */
    function cmdAsk(args) {
        const q = args.join(" ").trim();
        if (!q) {
            writeLine(span("ask", "t-accent2 t-b"), span("  — a tiny assistant that knows Sushrut", "t-dim"));
            blank();
            ["what are you best at?", "tell me about your projects", "are you open to work?", "what's your tech stack?", "what do you do for fun?"]
                .forEach((s) => writeLine(span("  ? ", "t-accent"), span(s, "t-dim")));
            blank();
            writeLine(span("Usage: ", "t-dim"), span("ask <your question>", "t-accent"));
            return;
        }
        const ql = " " + q.toLowerCase() + " ";
        const hit = ASK.find((it) => it.k.some((k) => ql.includes(k)));
        const ans = hit ? hit.a : ASK_DEFAULT;
        const wrap = make("div", "sk-term-ask");
        const head = make("div", "sk-term-line sk-term-ask__head");
        head.append(span("◆", "t-accent2"), span(" sush", "t-accent2 t-b"), span("  assistant", "t-dim"));
        wrap.append(head);
        ans.forEach((ln, i) => {
            const el = make("div", "sk-term-line sk-term-ask__line");
            if (!reduce) el.style.animationDelay = (i * 70) + "ms";
            el.append(linkify(ln || "\u00A0"));
            wrap.append(el);
        });
        output.append(wrap);
    }

    /* ----- man: manual pages ----- */
    function cmdMan(args) {
        const name = (args[0] || "").toLowerCase();
        if (!name) return writeLine(span("What manual page do you want? ", "t-warn"), span("Try: man ask", "t-dim"));
        const m = MAN[name];
        if (!m) {
            if (COMMANDS[name] || ALIASES[name]) return writeLine(span(name, "t-accent"), span(" — run ", "t-dim"), span("help", "t-accent"), span(" for a summary.", "t-dim"));
            return writeText("No manual entry for " + name, "t-err");
        }
        writeLine(span(name.toUpperCase() + "(1)", "t-accent2 t-b"), span("            SushrutOS Manual", "t-dim"));
        blank();
        writeLine(span("NAME", "t-accent"));
        writeText("    " + name);
        blank();
        writeLine(span("SYNOPSIS", "t-accent"));
        writeText("    " + m.s);
        blank();
        writeLine(span("DESCRIPTION", "t-accent"));
        m.d.forEach((l) => writeText("    " + l));
    }

    /* ----- sl: steam locomotive ----- */
    function cmdSl() {
        if (reduce) {
            const pre = make("pre", "sk-term-art");
            pre.textContent = TRAIN.join("\n");
            output.append(pre);
            scrollDown();
            return;
        }
        const pre = make("pre", "sk-term-train");
        pre.textContent = TRAIN.join("\n");
        screen.append(pre);
        const width = pre.scrollWidth || 420;
        let x = screen.clientWidth;
        const speed = Math.max(6, screen.clientWidth / 70);
        let raf = 0;
        const cleanup = () => { cancelAnimationFrame(raf); if (pre.parentNode) pre.remove(); slRAFs = slRAFs.filter((f) => f !== cleanup); };
        const step = () => {
            x -= speed;
            pre.style.transform = "translateX(" + x + "px)";
            if (x < -width) { cleanup(); return; }
            raf = requestAnimationFrame(step);
        };
        slRAFs.push(cleanup);
        raf = requestAnimationFrame(step);
    }

    function cmdNeofetch() {
        const wrap = make("div", "sk-term-fetch");
        const art = make("pre", "sk-term-art");
        art.textContent = TUX.join("\n");

        const info = make("div", "sk-term-info");
        const secs = Math.floor((Date.now() - BOOT_TIME) / 1000);
        const upM = Math.floor(secs / 60), upS = secs % 60;
        const rows = [
            ["OS", "SushrutOS 3.0 (Portfolio Linux) x86_64"],
            ["Host", "Manipal University Jaipur"],
            ["Kernel", "6.tt-hockey-generic"],
            ["Uptime", (upM ? upM + "m " : "") + upS + "s"],
            ["Packages", PROJECTS.length + " shipped (live)"],
            ["Shell", "sush 1.0"],
            ["DE", "Editorial"],
            ["WM", "GSAP + Lenis"],
            ["Terminal", "sk-term"],
            ["CPU", "Human Brain @ 2 a.m. (turbo)"],
            ["Memory", "caffeine / ∞"],
            ["Role", "Developer & ML Engineer"],
            ["Location", "Jaipur, IN → Bangalore (Philips)"],
        ];
        info.append((() => { const t = make("div", "sk-term-info__title"); t.append(span(USER, null), document.createTextNode("@"), span(HOST, null)); return t; })());
        info.append(make("div", "sk-term-info__rule", "-----------------"));
        rows.forEach(([k, v]) => {
            const r = make("div", "sk-term-info__row");
            r.append(make("span", "k", k), document.createTextNode(": " + v));
            info.append(r);
        });
        const sw = make("div", "sk-term-swatch");
        ["■", "■", "■", "■", "■", "■", "■", "■"].forEach((s, i) => {
            const cols = ["#ff5f57", "#febc2e", "#28c840", "#37d0ff", "#7aa2f7", "#bb9af7", "#00ffa3", "#ece5d8"];
            const c = make("span", null, s + " ");
            c.style.color = cols[i];
            sw.append(c);
        });
        info.append(sw);

        wrap.append(art, info);
        output.append(wrap);
    }

    function cmdClear() { output.replaceChildren(); }

    function cmdMatrix() {
        if (win.classList.contains("is-matrix")) return stopMatrix();
        startMatrix();
        writeText("Entering the matrix… (type `matrix` again, press Esc, or click to exit)", "t-dim");
    }

    function cmdExit() { closeTerminal(); }

    /* ---------------------------------------------------------------
       Matrix rain
    --------------------------------------------------------------- */
    let matrixRAF = null;
    let slRAFs = [];
    function startMatrix() {
        win.classList.add("is-matrix");
        const ctx = matrixCanvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
            matrixCanvas.width = screen.clientWidth * dpr;
            matrixCanvas.height = screen.clientHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        matrixCanvas._resize = resize;
        window.addEventListener("resize", resize);
        const fontSize = 15;
        const cols = Math.floor(screen.clientWidth / fontSize);
        const drops = new Array(cols).fill(0).map(() => Math.random() * -40);
        const glyphs = "ｱｲｳｴｵｶｷｸｹｺ01SUSHRUTKANE<>/{}$#*".split("");
        const accent = getComputedStyle(win).getPropertyValue("--t-accent").trim() || "#00ffa3";
        const draw = () => {
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, 0, screen.clientWidth, screen.clientHeight);
            ctx.font = fontSize + "px 'JetBrains Mono', monospace";
            for (let i = 0; i < drops.length; i++) {
                const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
                const x = i * fontSize, y = drops[i] * fontSize;
                ctx.fillStyle = Math.random() > 0.975 ? "#ffffff" : accent;
                ctx.fillText(ch, x, y);
                if (y > screen.clientHeight && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            matrixRAF = requestAnimationFrame(draw);
        };
        draw();
    }
    function stopMatrix() {
        win.classList.remove("is-matrix");
        if (matrixRAF) cancelAnimationFrame(matrixRAF);
        matrixRAF = null;
        if (matrixCanvas._resize) window.removeEventListener("resize", matrixCanvas._resize);
        const ctx = matrixCanvas.getContext("2d");
        ctx && ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }

    /* ---------------------------------------------------------------
       Command + alias tables
    --------------------------------------------------------------- */
    const COMMANDS = {
        help: cmdHelp,
        about: cmdAbout,
        whoami: cmdWhoami,
        skills: cmdSkills,
        projects: cmdProjects,
        experience: cmdExperience,
        education: cmdEducation,
        contact: cmdContact,
        resume: cmdResume,
        github: cmdGithub,
        open: (a) => openTarget(a[0]),
        neofetch: cmdNeofetch,
        fastfetch: cmdNeofetch,
        ls: cmdLs,
        cd: cmdCd,
        cat: cmdCat,
        pwd: cmdPwd,
        tree: cmdTree,
        echo: cmdEcho,
        date: cmdDate,
        uptime: cmdUptime,
        history: cmdHistory,
        uname: cmdUname,
        banner: cmdBanner,
        theme: cmdTheme,
        scanlines: cmdScan,
        matrix: cmdMatrix,
        sudo: cmdSudo,
        vim: cmdVim,
        nano: cmdVim,
        coffee: cmdCoffee,
        ask: cmdAsk,
        fortune: cmdFortune,
        cowsay: cmdCowsay,
        man: cmdMan,
        sl: cmdSl,
        clear: cmdClear,
        exit: cmdExit,
        help2: cmdHelp,
    };
    const ALIASES = {
        "ll": (a) => cmdLs(["-l", ...a]),
        "la": (a) => cmdLs(["-a", ...a]),
        "cls": cmdClear,
        "?": cmdHelp,
        "quit": cmdExit,
        "logout": cmdExit,
        "info": cmdAbout,
        "email": () => openTarget("email"),
        "social": cmdContact,
        "work": cmdProjects,
    };

    /* ---------------------------------------------------------------
       Boot sequence
    --------------------------------------------------------------- */
    let booted = false;
    let bootTimers = [];
    function clearBootTimers() { bootTimers.forEach(clearTimeout); bootTimers = []; }

    const BOOT = [
        ["[ ", "ok", "OK", " ] Reached target ", "Portfolio System"],
        ["[ ", "ok", "OK", " ] Started ", "Curiosity Daemon"],
        ["[ ", "ok", "OK", " ] Mounted ", "/home/sushrut"],
        ["[ ", "ok", "OK", " ] Loaded ", "machine-learning modules"],
        ["[ ", "info", "**", " ] Warming up ", "coffee.service…"],
        ["[ ", "ok", "OK", " ] Started ", "sk-term interactive shell"],
    ];

    function bootLine(parts) {
        const line = make("div", "sk-term-line sk-term-boot");
        line.append(
            document.createTextNode(parts[0]),
            span(parts[2], parts[1]),
            document.createTextNode(parts[3]),
            span(parts[4], "t-b")
        );
        output.append(line);
        scrollDown();
    }

    function finishBoot() {
        clearBootTimers();
        booted = true;
        blank();
        cmdNeofetch();
        blank();
        writeLine(span("Welcome. ", "t-accent2 t-b"), span("This is my portfolio as a shell. Type ", "t-dim"), span("help", "t-accent"), span(" to begin, ", "t-dim"), span("projects", "t-accent"), span(" to browse, or ", "t-dim"), span("ask", "t-accent"), span(" me anything.", "t-dim"));
        blank();
        inputLine.style.display = "";
        updatePrompt();
        setValue("");
        scrollDown();
        focusInput();
    }

    function playBoot() {
        output.replaceChildren();
        inputLine.style.display = "none";
        const login = make("div", "sk-term-line t-dim");
        login.textContent = "SushrutOS 3.0 LTS  tty1";
        output.append(login);
        blank();
        let t = 120;
        BOOT.forEach((parts) => {
            bootTimers.push(setTimeout(() => bootLine(parts), t));
            t += reduce ? 40 : 160 + Math.random() * 120;
        });
        bootTimers.push(setTimeout(finishBoot, t + 220));
    }

    /* ---------------------------------------------------------------
       Open / close + scroll lock + focus management
    --------------------------------------------------------------- */
    let isOpen = false;
    let lastFocus = null;

    const stopScroll = (e) => { e.stopPropagation(); };

    function lockBackground() {
        document.body.classList.add("sk-term-open");
        // Keep Lenis / native scroll from moving the page behind the overlay.
        overlay.addEventListener("wheel", stopScroll, { passive: false });
        overlay.addEventListener("touchmove", stopScroll, { passive: false });
    }
    function unlockBackground() {
        document.body.classList.remove("sk-term-open");
        overlay.removeEventListener("wheel", stopScroll, { passive: false });
        overlay.removeEventListener("touchmove", stopScroll, { passive: false });
    }

    function openTerminal() {
        if (isOpen) return;
        isOpen = true;
        lastFocus = document.activeElement;
        overlay.classList.add("is-open");
        launcher.classList.add("is-hidden");
        lockBackground();
        if (!booted) playBoot();
        else { updatePrompt(); requestAnimationFrame(focusInput); }
        requestAnimationFrame(() => { if (booted) focusInput(); scrollDown(); });
    }

    function closeTerminal() {
        if (!isOpen) return;
        isOpen = false;
        stopMatrix();
        slRAFs.slice().forEach((fn) => fn());
        overlay.classList.remove("is-open");
        launcher.classList.remove("is-hidden");
        unlockBackground();
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { launcher.focus(); } }
        else launcher.focus();
    }

    /* ---------------------------------------------------------------
       Events
    --------------------------------------------------------------- */
    launcher.addEventListener("click", openTerminal);
    dotClose.addEventListener("click", closeTerminal);
    dotMin.addEventListener("click", closeTerminal);
    dotMax.addEventListener("click", () => {
        win.classList.toggle("is-max");
        // reset any drag offset when toggling maximise
        win.style.transform = "";
        focusInput();
    });
    btnTheme.addEventListener("click", () => {
        const themes = ["green", "amber", "matrix", "tokyo", "paper"];
        const i = themes.indexOf(win.dataset.theme);
        win.dataset.theme = themes[(i + 1) % themes.length];
        safeStore.set("sk-term-theme", win.dataset.theme);
        focusInput();
    });
    btnScan.addEventListener("click", () => { cmdScan(); focusInput(); });

    // Click anywhere on the screen focuses the input (real-terminal feel),
    // unless the user is selecting text or clicking a link.
    screen.addEventListener("mousedown", (e) => {
        if (win.classList.contains("is-matrix")) { stopMatrix(); return; }
        if (e.target.closest("a")) return;
        if (window.getSelection && String(window.getSelection())) return;
        setTimeout(focusInput, 0);
    });

    capture.addEventListener("input", renderInput);
    capture.addEventListener("keyup", (e) => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) renderInput(); });
    capture.addEventListener("focus", () => win.classList.remove("is-blurred"));
    capture.addEventListener("blur", () => win.classList.add("is-blurred"));

    capture.addEventListener("keydown", (e) => {
        const ctrl = e.ctrlKey || e.metaKey;

        if (e.key === "Enter") { e.preventDefault(); if (win.classList.contains("is-matrix")) stopMatrix(); run(capture.value); return; }
        if (e.key === "Tab") { e.preventDefault(); complete(); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); historyPrev(); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); historyNext(); return; }
        if (e.key === "Escape") { e.preventDefault(); if (win.classList.contains("is-matrix")) return stopMatrix(); closeTerminal(); return; }

        if (ctrl && (e.key === "l" || e.key === "L")) { e.preventDefault(); cmdClear(); return; }
        if (ctrl && (e.key === "c" || e.key === "C")) {
            if (window.getSelection && String(window.getSelection())) return; // allow copy
            e.preventDefault(); echoCommand(capture.value + "^C"); setValue(""); pushHistory(""); scrollDown(); return;
        }
        if (ctrl && (e.key === "u" || e.key === "U")) { e.preventDefault(); const p = capture.selectionStart; setValue(capture.value.slice(p), 0); return; }
        if (ctrl && (e.key === "k" || e.key === "K")) { e.preventDefault(); const p = capture.selectionStart; setValue(capture.value.slice(0, p), p); return; }
        if (ctrl && (e.key === "a" || e.key === "A")) { e.preventDefault(); try { capture.setSelectionRange(0, 0); } catch (x) { } renderInput(); return; }
        if (ctrl && (e.key === "e" || e.key === "E")) { e.preventDefault(); const n = capture.value.length; try { capture.setSelectionRange(n, n); } catch (x) { } renderInput(); return; }
        if (ctrl && (e.key === "w" || e.key === "W")) {
            e.preventDefault();
            const p = capture.selectionStart;
            const left = capture.value.slice(0, p).replace(/\s*\S+\s*$/, "");
            setValue(left + capture.value.slice(p), left.length);
            return;
        }
    });

    // Global shortcuts: Ctrl+`  and the bare `  key open the terminal.
    document.addEventListener("keydown", (e) => {
        if (isOpen) return;
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
        if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) { e.preventDefault(); openTerminal(); return; }
        if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "`" || e.key === "~")) { e.preventDefault(); openTerminal(); }
    });

    // Skip the boot sequence on any interaction.
    const skipBoot = () => { if (isOpen && !booted) finishBoot(); };
    overlay.addEventListener("keydown", (e) => { if (!booted && e.key !== "Escape") skipBoot(); }, true);
    body.addEventListener("mousedown", () => { if (!booted) skipBoot(); });

    /* ---------------------------------------------------------------
       Drag the window by its title bar (desktop)
    --------------------------------------------------------------- */
    (function draggable() {
        let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
        const onDown = (e) => {
            if (e.target.closest("button")) return;
            if (win.classList.contains("is-max")) return;
            dragging = true;
            const t = getComputedStyle(win).transform;
            if (t && t !== "none") { const m = new DOMMatrixReadOnly(t); ox = m.m41; oy = m.m42; } else { ox = 0; oy = 0; }
            sx = e.clientX; sy = e.clientY;
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
            e.preventDefault();
        };
        const onMove = (e) => {
            if (!dragging) return;
            win.style.transform = "translate(" + (ox + e.clientX - sx) + "px," + (oy + e.clientY - sy) + "px)";
        };
        const onUp = () => { dragging = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        titlebar.addEventListener("mousedown", onDown);
    })();

    /* ---------------------------------------------------------------
       Mount
    --------------------------------------------------------------- */
    document.body.append(launcher, overlay);
    updatePrompt();
    renderInput();

    // expose a tiny hook for debugging / manual open
    window.skTerminal = { open: openTerminal, close: closeTerminal };
})();
