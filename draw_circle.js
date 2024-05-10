function createSegmentedCircle({segments, actualCount, text, ringThickness, ringColor, textAbove, textBelow, divId}) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const width = 200; // Breite und Höhe des SVG
  const height = 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 90; // Außenradius des Rings
  const innerRadius = outerRadius - ringThickness; // Innenradius des Rings
  const gap = 0.04; // Lückenbreite als Bruchteil des Gesamtwinkels

  // Erstelle ein SVG-Element
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Erzeuge die Segmente des Kreises
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI) / segments;
    const startAngle = i * angle - Math.PI / 2 + gap / 2;
    const endAngle = (i + 1) * angle - Math.PI / 2 - gap / 2;

    // Berechne Start- und Endpunkte jedes Bogens
    const outerStartX = centerX + outerRadius * Math.cos(startAngle);
    const outerStartY = centerY + outerRadius * Math.sin(startAngle);
    const outerEndX = centerX + outerRadius * Math.cos(endAngle);
    const outerEndY = centerY + outerRadius * Math.sin(endAngle);

    const innerStartX = centerX + innerRadius * Math.cos(endAngle);
    const innerStartY = centerY + innerRadius * Math.sin(endAngle);
    const innerEndX = centerX + innerRadius * Math.cos(startAngle);
    const innerEndY = centerY + innerRadius * Math.sin(startAngle);

    // Erzeuge den Bogen (Path)
    const path = document.createElementNS(svgNS, 'path');
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = [
      'M',
      outerStartX,
      outerStartY,
      'A',
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      1,
      outerEndX,
      outerEndY,
      'L',
      innerStartX,
      innerStartY,
      'A',
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      0,
      innerEndX,
      innerEndY,
      'Z',
    ].join(' ');
    path.setAttribute('d', d);
    // if aktualCount is less or equal to i, set fill color to ringColor else to lightgrey
    path.setAttribute('fill', i < actualCount ? ringColor : 'lightgrey');
    svg.appendChild(path);
  }

  // Erzeuge den Text in der Mitte des Kreises
  const fontFamily = 'Roboto';
  const textElement = document.createElementNS(svgNS, 'text');
  textElement.setAttribute('x', centerX);
  textElement.setAttribute('y', centerY);
  // set color of text to grey
  textElement.setAttribute('fill', 'grey');
  // set fontsize to large and font family to sans-serif
  textElement.setAttribute('font-family', fontFamily);
  textElement.setAttribute('font-size', '32');
  textElement.setAttribute('dominant-baseline', 'middle');
  textElement.setAttribute("text-anchor", "middle");
  textElement.textContent = text;
  svg.appendChild(textElement);

  // place a small text above the other text
    const textElement2 = document.createElementNS(svgNS, 'text');
    // set x and y position of the text with offset
    textElement2.setAttribute('x', centerX);
    textElement2.setAttribute('y', centerY - 32);
    textElement2.setAttribute('fill', 'grey');
    textElement2.setAttribute('font-family', fontFamily);
    textElement2.setAttribute('font-size', '12');
    textElement2.setAttribute('dominant-baseline', 'middle');
    textElement2.setAttribute("text-anchor", "middle");
    textElement2.textContent = textAbove;
    svg.appendChild(textElement2);

    // place a small text below the other text
    const textElement3 = document.createElementNS(svgNS, 'text');
    // set x and y position of the text with offset
    textElement3.setAttribute('x', centerX);
    textElement3.setAttribute('y', centerY + 32);
    textElement3.setAttribute('fill', 'grey');
    textElement3.setAttribute('font-family', fontFamily);
    textElement3.setAttribute('font-size', '12');
    textElement3.setAttribute('dominant-baseline', 'middle');
    textElement3.setAttribute("text-anchor", "middle");
    textElement3.textContent = textBelow;
    svg.appendChild(textElement3);

  // check id divId is null or empty if not add the svg to the div with the id
    if (divId && divId !== '') {
        document.getElementById(divId).innerHTML= svg.outerHTML;
    } else {
        document.body.appendChild(svg);
    }
}

