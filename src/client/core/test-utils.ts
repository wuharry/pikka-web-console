// src/client/core/test-utils.ts

/**
 * Console 監控器測試工具
 * 用於驗證 console 攔截和錯誤處理功能
 */
export function testConsoleMonitor(): void {
  console.log("開始測試 Console Monitor...");

  setTimeout(() => {
    // 測試基本 console 輸出
    console.log("這是一個 log 消息");
    console.info("這是一個 info 消息");
    console.warn("這是一個 warning 消息");
    console.error("這是一個 error 消息");

    // 測試語法錯誤（這會被 console.error 捕獲）
    try {
      eval("<invalid syntax>");
    } catch (e) {
      console.error("Syntax Error:", e);
    }

    // 測試運行時錯誤
    setTimeout(() => {
      try {
        // @ts-ignore - 故意訪問未定義的變量
        undefinedVariable.someProperty;
      } catch (e) {
        console.error("Runtime Error:", e);
      }
    }, 1000);

    // 測試 Promise rejection
    setTimeout(() => {
      Promise.reject(new Error("測試 Promise rejection"));
    }, 1500);

    // 測試資源載入錯誤
    setTimeout(() => {
      const img = new Image();
      img.src = "https://example.com/nonexistent-image.jpg";
      document.body.appendChild(img);
    }, 2000);

    console.log("Console Monitor 測試已啟動");
  }, 500);
}

/**
 * 創建大量測試數據
 * 用於測試性能和UI顯示
 */
export function generateTestData(): void {
  console.log("開始生成測試數據...");

  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      console.log(`Log 消息 #${i + 1}: ${new Date().toISOString()}`);
      console.info(`Info 消息 #${i + 1}: 這是詳細信息`);
      
      if (i % 3 === 0) {
        console.warn(`Warning 消息 #${i + 1}: 注意這個警告`);
      }
      
      if (i % 5 === 0) {
        console.error(`Error 消息 #${i + 1}: 發生了錯誤`);
      }
    }, i * 200);
  }
}

/**
 * 測試複雜對象的序列化
 */
export function testComplexObjects(): void {
  console.log("測試複雜對象序列化...");

  const complexObject = {
    name: "測試對象",
    nested: {
      array: [1, 2, 3, "字符串"],
      date: new Date(),
      nullValue: null,
      undefinedValue: undefined
    },
    circular: {} as any
  };
  
  // 創建循環引用
  complexObject.circular.self = complexObject;

  console.log("複雜對象:", complexObject);
  console.info("數組:", [1, 2, 3, { key: "value" }]);
  console.warn("函數:", function testFunction() { return "test"; });
  
  // 測試不可序列化的對象
  const element = document.createElement('div');
  console.error("DOM 元素:", element);
}
