export function setupTabs() {
  const tabList = document.querySelector<HTMLUListElement>("#tab-links")!;
  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
  console.log(tabs);

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
      console.log(target.innerText);

      // 添加 active 狀態到當前 tab
      target.classList.add(
        "active",
        "text-gray-50",
        TAB_COLOR_MAP[target.innerText as keyof typeof TAB_COLOR_MAP]
      );
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
      return "<div>Log 內容</div>";
    case "error":
      return "<div>Error 內容</div>";
    // 其他 cases...
    default:
      return "<div>預設內容</div>";
  }
}

// output型別很多,如果真的不行的話就把它設定成any
function addResult(input: string, output: unknown): string {
  const outType = typeof output;
  let outputAsString: string;
  const outputElement = document.createElement("div");
  const inputElement = document.createElement("div");

  switch (outType) {
    case "number":
      break;
    case "boolean":
      break;
    case "object":
      if (output === null) {
        outputAsString = "null";
      } else if (output instanceof Array) {
        outputAsString = `[${output.join(", ")}]`;
      } else {
        outputAsString = JSON.stringify(output, null, 2);
      }
      break;
    case "function":
      break;
    case "symbol":
      break;
    case "undefined":
      break;

    default:
      // string
      break;
  }
  inputElement.classList.add("console-input-log");
  inputElement.textContent = `> ${input}`;
  outputElement.classList.add("console-input-log");
  outputElement.textContent = outputAsString;

  return "";
}
