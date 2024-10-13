function formatHTML(inputHTML) {
    // Function to add closing slashes to self-closing tags
    function closeSelfClosingTags(html) {
      return html.replace(
        /<(br|hr|img|input|meta|link)([^>]*)>/gi,
        (match, tagName, attributes) => {
          // Check if the tag is already self-closed
          if (match.endsWith('/>')) {
            return match;
          } else {
            // Ensure there's a space between tag name and attributes
            const attrs = attributes.trim();
            return `<${tagName}${attrs ? ' ' + attrs : ''} />`;
          }
        }
      );
    }
  
    // Function to format style attributes
    function formatStyleAttributes(html) {
      return html.replace(
        /style="([^"]*)"/gi,
        (match, cssText) => {
          // Split CSS properties by semicolon
          let properties = cssText
            .split(';')
            .map((prop) => prop.trim())
            .filter((prop) => prop.length > 0);
  
          // Process each property
          let formattedProperties = properties.map((prop) => {
            let [key, value] = prop.split(':').map((s) => s.trim());
            return `${key}: ${value};`;
          });
  
          // Join the properties back into a string
          let formattedCssText = formattedProperties.join(' ');
  
          return `style="${formattedCssText}"`;
        }
      );
    }
  
    // Function to format the HTML indentation
    function indentHTML(html) {
      const indentSize = 4;
      let formattedHtml = '';
      let indentLevel = 0;
  
      // Split HTML into tags and text
      const tokens = html.split(/(<[^>]+>)/g).filter((token) => token.trim() !== '');
  
      tokens.forEach((token) => {
        if (token.startsWith('</')) {
          // Closing tag, decrease indent
          indentLevel = Math.max(indentLevel - 1, 0);
        }
  
        // Add indentation
        formattedHtml += ' '.repeat(indentLevel * indentSize) + token.trim() + '\n';
  
        if (
          token.startsWith('<') &&
          !token.startsWith('</') &&
          !token.endsWith('/>') &&
          !token.startsWith('<img')
        ) {
          // Opening tag, increase indent
          indentLevel++;
        }
      });
  
      return formattedHtml.trim();
    }
  
    // Apply the transformations
    let html = inputHTML;
  
    html = closeSelfClosingTags(html);
    html = formatStyleAttributes(html);
    html = indentHTML(html);
  
    return html;
  }
  
  // Main function to execute
  (async function () {
    // Check if we are on a WordPress edit page
    if (!window.location.href.includes('/wp-admin/post.php')) {
      alert('This extension works only on WordPress edit pages.');
      return;
    }
  
    try {
      // Find all elements with class 'block-editor-plain-text'
      const elements = document.querySelectorAll('.block-editor-plain-text');
  
      if (elements.length === 0) {
        alert('No elements with class "block-editor-plain-text" found.');
        return;
      }
  
      for (const element of elements) {
        // Get the current content
        let rawHTML = element.value || element.innerText || element.innerHTML;
  
        if (rawHTML) {
          // Format the HTML content
          let formattedHTML = await formatHTML(rawHTML);
  
          // Set the formatted content back
          if (element.value !== undefined) {
            element.value = formattedHTML;
            // Dispatch input event to notify React of the change
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
          } else if (element.innerText !== undefined) {
            element.innerText = formattedHTML;
          } else {
            element.innerHTML = formattedHTML;
          }
        }
      }
  
      alert(
        `Formatted ${elements.length} element(s) with class "block-editor-plain-text" successfully!`
      );
    } catch (error) {
      console.error('Error formatting elements:', error);
      alert('An error occurred while formatting elements.');
    }
  })();
  