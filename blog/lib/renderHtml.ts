const renderHtml = (blocks: any[]) => {
  const html = blocks.map((block) => {
    switch (block.type) {
      case "code":
        return `<pre><code>${block.data.code}</pre></code>`;
        
      case "header":
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;

      case "image":
        const classes = [];
        if (block.data.stretched) {
          classes.push("stretched");
        }
        if (block.data.withBorder) {
          classes.push("border");
        }
        if (block.data.withBackground) {
          classes.push("bg-light");
        }
        return `<figure><img class="${classes.join(" ")}" src="${
          block.data.file.url
        }" style="max-width: 100%;">${block.data.caption}</figure>`;

      case "list":
        const listItems = block.data.items.map((item: any) => {
          return `<li>${item}</li>`;
        });
        if (block.data.style === "ordered") {
          return `<ol>${listItems.join("")}</ol>`;
        }
        if (block.data.style === "unordered") {
          return `<ul>${listItems.join("")}</ul>`;
        }
        break;
      case "paragraph":
        return `<p>${block.data.text}</p>`;

      case "quote":
        let caption;
        if (block.data.caption) {
          caption = `<footer>${block.data.caption}</footer>`;
        }
        return `<blockquote>${block.data.text}${caption}</blockquote>`;

      case "raw":
        return block.data.html;

      case "table":
        const tableRows = block.data.content.map((row: any[]) => {
          const tableCells = row.map((cell: any) => `<td>${cell}</td>`);
          return `<tr>${tableCells.join("")}</tr>`;
        });
        return `<table><tbody>${tableRows.join("")}</tbody></table>`;
    }
  });

  return html;
};

export default renderHtml;
