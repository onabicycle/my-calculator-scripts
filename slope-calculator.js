 document.addEventListener('DOMContentLoaded', () => {
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const width = 720 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        let currentMethod = 'points';

        const svg = d3.select("#slope-viz")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([-10, 10]).range([0, width]);
        const y = d3.scaleLinear().domain([-10, 10]).range([height, 0]);

        svg.append("g").attr("transform", `translate(0,${height / 2})`).call(d3.axisBottom(x));
        svg.append("g").attr("transform", `translate(${width / 2},0)`).call(d3.axisLeft(y));

        const renderResults = (workingOut, finalResults) => {
            document.getElementById('working-out').innerHTML = workingOut;
            document.getElementById('final-results').innerHTML = finalResults;

            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        };

        window.switchMethod = (event, method) => {
            currentMethod = method;
            document.querySelectorAll('.calc-method').forEach(el => el.classList.remove('active'));
            event.currentTarget.classList.add('active');

            document.getElementById('point-inputs').style.display = method === 'points' ? 'block' : 'none';
            document.getElementById('slope-inputs').style.display = method === 'slope' ? 'block' : 'none';
        };

        const updateVisualization = (x1, y1, x2, y2) => {
            // Clear previous elements
            svg.selectAll(".slope-line, .point, .point-label, .tooltip").remove();
            // Add Title
            svg.append("text")
                .attr("x", width / 2) // Center horizontally
                .attr("y", -10) // Slightly above the plot
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .style("fill", "#b03b5a")
                .text("Line Plot Showing Slope and Angle");
            // Add a tooltip div
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background-color", "rgba(0, 0, 0, 0.7)")
                .style("color", "white")
                .style("padding", "5px 10px")
                .style("border-radius", "4px")
                .style("font-size", "12px")
                .style("visibility", "hidden");
            // Draw Grid Lines
            const grid = svg.append("g").attr("class", "grid");

            // Horizontal grid lines
            grid.selectAll(".h-grid")
                .data(y.ticks(10))
                .enter()
                .append("line")
                .attr("class", "h-grid")
                .attr("x1", x(-10))
                .attr("x2", x(10))
                .attr("y1", d => y(d))
                .attr("y2", d => y(d))
                .style("stroke", "lightgray")
                .style("stroke-dasharray", "3,3"); // Dashed lines

            // Vertical grid lines
            grid.selectAll(".v-grid")
                .data(x.ticks(10))
                .enter()
                .append("line")
                .attr("class", "v-grid")
                .attr("x1", d => x(d))
                .attr("x2", d => x(d))
                .attr("y1", y(-10))
                .attr("y2", y(10))
                .style("stroke", "lightgray")
                .style("stroke-dasharray", "3,3");
            // Draw the line
            svg.append("line")
                .attr("class", "slope-line")
                .attr("x1", x(x1))
                .attr("y1", y(y1))
                .attr("x2", x(x2))
                .attr("y2", y(y2))
                .style("stroke", "var(--primary-color)")
                .style("stroke-width", 2);

            const points = [
                { x: x1, y: y1, label: "\\((x_1, y_1)\\)" },
                { x: x2, y: y2, label: "\\((x_2, y_2)\\)" }
            ];

            // Draw the points
            svg.selectAll(".point")
                .data(points)
                .enter()
                .append("circle")
                .attr("class", "point")
                .attr("cx", d => x(d.x))
                .attr("cy", d => y(d.y))
                .attr("r", 5)
                .style("fill", "var(--primary-color)")
                .on("mouseover", (event, d) => {
                    tooltip.style("visibility", "visible").text(`(${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);
                })
                .on("mousemove", event => {
                    tooltip.style("top", `${event.pageY - 20}px`).style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => {
                    tooltip.style("visibility", "hidden");
                });

            // Draw point labels
            svg.selectAll(".point-label")
                .data(points)
                .enter()
                .append("foreignObject")
                .attr("class", "point-label")
                .attr("x", d => x(d.x) + 10)
                .attr("y", d => y(d.y) - 10)
                .attr("width", 100)
                .attr("height", 30)
                .append("xhtml:div")
                .html(d => d.label);

            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        };


        const calculateFromPoints = () => {
            const x1 = parseFloat(document.getElementById('x1').value) || 0;
            const y1 = parseFloat(document.getElementById('y1').value) || 0;
            const x2 = parseFloat(document.getElementById('x2').value) || 0;
            const y2 = parseFloat(document.getElementById('y2').value) || 0;

            const slope = (y2 - y1) / (x2 - x1);
            const angle = Math.atan(slope) * (180 / Math.PI);

            const workingOut = `
            \\[
            \\text{Slope: } m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${slope.toFixed(2)}
            \\]
            \\[
            \\text{Angle: } \\theta = \\tan^{-1}(m) = \\tan^{-1}(${slope.toFixed(2)}) = ${angle.toFixed(2)}^{\\circ}
            \\]
        `;

            const finalResults = `
            \\[
            \\text{Slope: } m = ${slope.toFixed(2)}, \\quad \\text{Angle: } \\theta = ${angle.toFixed(2)}^{\\circ}
            \\]
        `;

            renderResults(workingOut, finalResults);
            updateVisualization(x1, y1, x2, y2);
        };

        const calculateFromSlope = () => {
            const x1 = parseFloat(document.getElementById('point-x').value) || 0;
            const y1 = parseFloat(document.getElementById('point-y').value) || 0;
            const distance = parseFloat(document.getElementById('distance').value) || 0;
            const slope = parseFloat(document.getElementById('slope-value').value);
            const angle = parseFloat(document.getElementById('angle').value);

            let m = slope;
            if (!isNaN(angle)) {
                m = Math.tan((Math.PI / 180) * angle);
            }

            const dx = distance / Math.sqrt(1 + m * m);
            const dy = m * dx;

            const x2 = x1 + dx;
            const y2 = y1 + dy;

            const workingOut = `
            \\[
            \\text{Slope: } m = ${m.toFixed(2)} \\quad \\text{(calculated from \\(\\theta\\))}
            \\]
            \\[
            \\Delta x = \\frac{d}{\\sqrt{1 + m^2}} = \\frac{${distance}}{\\sqrt{1 + (${m.toFixed(2)})^2}} = ${dx.toFixed(2)}
            \\]
            \\[
            \\Delta y = m \\cdot \\Delta x = ${m.toFixed(2)} \\cdot ${dx.toFixed(2)} = ${dy.toFixed(2)}
            \\]
            \\[
            x_2 = x_1 + \\Delta x = ${x1} + ${dx.toFixed(2)} = ${x2.toFixed(2)}
            \\]
            \\[
            y_2 = y_1 + \\Delta y = ${y1} + ${dy.toFixed(2)} = ${y2.toFixed(2)}
            \\]
        `;

            const finalResults = `
            \\[
            \\text{Second Point: } (x_2, y_2) = (${x2.toFixed(2)}, ${y2.toFixed(2)})
            \\]
        `;

            renderResults(workingOut, finalResults);
            updateVisualization(x1, y1, x2, y2);
        };

        window.calculate = () => {
            if (currentMethod === 'points') {
                calculateFromPoints();
            } else {
                calculateFromSlope();
            }
        };

        calculate();
    });
    document.addEventListener('DOMContentLoaded', () => {
// Get the page URL and title dynamically
        const pageUrl = window.location.href;
        const pageTitle = document.title;

// Construct the attribution text with an embeddable link
        const htmlAttributionText = `HTML: Attribution: <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">${pageTitle}</a>`;
        const markdownAttributionText = `Markdown: [${pageTitle}](${pageUrl})`;

// Update the attribution placeholders
        document.getElementById('attributionHtml').innerHTML = htmlAttributionText;
        document.getElementById('attributionMarkdown').innerText = markdownAttributionText;

// Function to copy HTML attribution
        document.getElementById('copyHtmlAttribution').addEventListener('click', () => {
            const plainHtmlAttribution = `Attribution: <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">${pageTitle}</a>`;
            navigator.clipboard.writeText(plainHtmlAttribution).then(() => {
                showFeedback();
            }).catch((err) => {
                console.error('Error copying HTML attribution:', err);
            });
        });

// Function to copy Markdown attribution
        document.getElementById('copyMarkdownAttribution').addEventListener('click', () => {
            navigator.clipboard.writeText(markdownAttributionText).then(() => {
                showFeedback();
            }).catch((err) => {
                console.error('Error copying Markdown attribution:', err);
            });
        });

// Function to show feedback message
        function showFeedback() {
            const feedback = document.getElementById('copyFeedback');
            feedback.style.display = 'block';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 2000);
        }
    });
