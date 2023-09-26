// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'hoge',
    title: '美金轉新台幣',
    contexts: ["selection"],
  });
});

// 處理右鍵選單點擊事件
chrome.contextMenus.onClicked.addListener((info) => {
  // 檢查 info.menuItemId 是否為 'hoge'
  if (info.menuItemId === 'hoge') {
    console.log(info);
    // 判斷是否是選擇文字上點擊右鍵
    if (info.selectionText) {
      // 取得選取文字
      const selectedText = info.selectionText;
      if (/^\d+(\.\d+)?$/.test(selectedText)) {

        // 轉換匯率
        const currencyConverter = new CurrencyConverter();
        const convertedAmount = currencyConverter.convert(selectedText, 'USD', 'TWD');
        console.log(convertedAmount);


        // 取得瀏覽器視窗的 tabId
        const tabId = info.tabId;


        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs[0];
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: (convertedAmount) => {
              const selection = window.getSelection();
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const topOffset = rect.top + window.scrollY;
              const leftOffset = rect.left + window.scrollX;              // 創建一個 <div> 元素，用於顯示轉換後的數值
              const div = document.createElement('div');
              div.textContent = `${convertedAmount} 新台幣`;
              div.style.backgroundColor = 'yellow';
              div.style.padding = '10px';
              div.style.position = 'absolute';
              div.style.top = `${topOffset + rect.height}px`;
              div.style.left = `${leftOffset}px`;
              div.style.zIndex = '9999';
              document.body.appendChild(div);
            },
            args: [convertedAmount]
          });
        });


      }
    }
  }
});

// 匯率轉換器
class CurrencyConverter {
  constructor() {
    this.exchangeRates = {
      'TWD': 28.3,
      'USD': 1
    };
  }

  convert(amount, fromCurrency = 'USD', toCurrency) {
    return parseFloat(amount) * this.exchangeRates[toCurrency];
  }
}
