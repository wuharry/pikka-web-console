export function setupTabs() {
  const tabList = document.querySelector<HTMLUListElement>("#tab-links")!;
  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');

  const TAB_COLOR_MAP = {
    Log: "bg-blue-300",
    Error: "bg-red-300",
    Warn: "bg-yellow-300",
    Info: "bg-green-300",
    All: "bg-gray-300",
  };
  const ALL_BG_COLORS = Object.values(TAB_COLOR_MAP);

  tabs.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      // 移除所有 active 狀態
      tabs.forEach((tab) =>
        tab.classList.remove("active", "text-gray-50", ...ALL_BG_COLORS)
      );

      // 添加 active 狀態到當前 tab
      target.classList.add(
        "active",
        "text-gray-50",
        TAB_COLOR_MAP[target.innerText as keyof typeof TAB_COLOR_MAP]
      );

      switchContent(target.innerText.toLowerCase());
    });
  });
}

function switchContent(tabType: string) {
  const content = document.querySelector("#tab-content");
  if (content) {
    content.innerHTML = getTabContent(tabType);
  }
}

function getTabContent(tabType: string): string {
  switch (tabType) {
    case "log":
      return "<div>呈現Log 內容</div>";
    case "error":
      return "<div>呈現Error 內容</div>";
    case "warn":
      return "<div>呈現Warn 內容</div>";
    case "info":
      return "<div>呈現Info 內容</div>";
    case "all":
      return "<div>呈現All 內容</div>";
    default:
      return "<div>預設內容</div>";
  }
}

// output型別很多,如果真的不行的話就把它設定成any,這個是獲取到api輸出
function addResult(input: string, output: unknown): string {
  const outType = typeof output;
  let outputAsString: string;
  let isCodeBlock = false;
  let typeColorClass = "";
  const outputElement = document.createElement("div");
  const inputElement = document.createElement("div");

  const typeColors = {
    string: "text-green-600",
    number: "text-red-600",
    boolean: "text-purple-600",
    null: "text-gray-500",
    undefined: "text-gray-500",
    function: "text-blue-600",
    object: "text-indigo-600",
    array: "text-orange-600",
    symbol: "text-pink-600",
    bigint: "text-yellow-600",
  };

  switch (outType) {
    case "number":
      outputAsString = String(output);
      typeColorClass = typeColors.number;
      break;
    case "boolean":
      outputAsString = String(output);
      typeColorClass = typeColors.boolean;
      break;
    case "string":
      outputAsString = `"${output}"`;
      typeColorClass = typeColors.string;
      break;
    case "object":
      if (output === null) {
        outputAsString = "null";
        typeColorClass = typeColors.null;
      } else if (Array.isArray(output)) {
        if (output.length <= 5) {
          outputAsString = `[${output
            .map((item) =>
              typeof item === "string" ? `"${item}"` : String(item)
            )
            .join(", ")}]`;
        } else {
          outputAsString = JSON.stringify(output, null, 2);
          isCodeBlock = true;
        }
        typeColorClass = typeColors.array;
      } else {
        try {
          outputAsString = JSON.stringify(output, null, 2);
          isCodeBlock = true;
        } catch (error) {
          outputAsString = "[Circular Reference or Non-serializable Object]";
        }
        typeColorClass = typeColors.object;
      }
      break;
    case "function":
      outputAsString = (output as Function).toString();
      isCodeBlock = true;
      typeColorClass = typeColors.function;
      break;
    case "symbol":
      outputAsString = String(output);
      typeColorClass = typeColors.symbol;
      break;
    case "undefined":
      outputAsString = "undefined";
      typeColorClass = typeColors.undefined;
      break;
    case "bigint":
      outputAsString = String(output) + "n";
      typeColorClass = typeColors.bigint;
      break;
    default:
      outputAsString = String(output);
      typeColorClass = "text-gray-700";
      break;
  }

  inputElement.classList.add(
    "font-mono",
    "text-blue-700",
    "text-sm",
    "my-1",
    "px-2",
    "py-1"
  );
  inputElement.textContent = `> ${input}`;

  outputElement.classList.add(
    "font-mono",
    "text-sm",
    "my-1",
    "ml-4",
    "px-2",
    "py-1",
    typeColorClass
  );

  if (isCodeBlock) {
    const codeElement = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = outputAsString;
    code.classList.add("language-javascript");
    codeElement.appendChild(code);
    codeElement.classList.add("console-code-block");
    outputElement.appendChild(codeElement);
  } else {
    outputElement.textContent = outputAsString;
  }

  return outputAsString;
}

function ErrorMonitor() {
  const errorSet = new Set();
  const infoSet = new Set();
  const warnSet = new Set();
  const logSet = new Set();
  // 捕捉資源錯誤的
  window.onerror = (message, source, lineno, colno, error) => {
    errorSet.add({ message, source, lineno, colno, error });
  };
}
