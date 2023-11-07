const loader = document.getElementById("loader");
const data = document.getElementById("data");
const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");
const searchInput = document.getElementById("searchInput");

let lines = [];
let originalLines = [];
const visibleLines = 15;
const lineHeight = 20;
let isSearching = false;

function updateScrollableHeight(totalLines) {
  const totalHeight = totalLines * lineHeight;
  output.style.height = `${totalHeight}px`;
}

function renderLines(startIndex) {
  const startLine = Math.max(0, startIndex - visibleLines);
  const endLine = Math.min(lines.length, startIndex + visibleLines * 2);

  output.innerHTML = "";

  const spacer = document.createElement("div");
  spacer.style.height = `${startLine * lineHeight}px`;
  output.appendChild(spacer);

  const fragment = document.createDocumentFragment();

  for (let i = startLine; i < endLine; i++) {
    if (lines[i].includes("firstName")) continue;

    const lineArray = lines[i].split(",");

    const fullName = `${lineArray[0]} ${lineArray[1]}`;
    const address = `${lineArray[2]}, ${lineArray[3]}, ${lineArray[4]}`;
    const email = lineArray[5];
    const phone = lineArray[6];

    const li = document.createElement("li");

    li.textContent = `${
      isSearching ? i + 1 : i
    }) ${fullName} | ${address} | ${email} | ${phone}`;

    fragment.appendChild(li);
  }

  output.appendChild(fragment);

  if (lines.length <= 0) {
    const noDataElement = document.createElement("li");
    noDataElement.textContent = "No data found";
    output.appendChild(noDataElement);
  }
}

function debounce(func, delay) {
  let debounceTimer;

  return function () {
    const args = arguments;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedSearch = debounce((searchTerm) => {
  lines = searchTerm
    ? originalLines.filter((line) => {
        const splittedLine = line.split(",");
        const splittedSearchTerm = searchTerm.split(" ");

        return splittedSearchTerm.every((term) =>
          splittedLine.some((item) =>
            item.toLowerCase().includes(term.toLowerCase())
          )
        );
      })
    : [...originalLines];

  updateScrollableHeight(lines.length);
  renderLines(0);
}, 300);

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  isSearching = !!searchTerm;
  debouncedSearch(searchTerm);
});

fileInput.addEventListener("change", (e) => {
  loader.classList.remove("hidden");

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    originalLines = e.target.result.split("\n");
    lines = [...originalLines];

    updateScrollableHeight(lines.length);
    renderLines(0);

    loader.classList.add("hidden");
    data.classList.remove("hidden");
    searchInput.classList.remove("hidden");
  };

  reader.readAsText(file);
});

data.addEventListener("scroll", () => {
  requestAnimationFrame(() => {
    const scrollTop = data.scrollTop;
    const startIndex = Math.floor(scrollTop / lineHeight);
    renderLines(startIndex);
  });
});
