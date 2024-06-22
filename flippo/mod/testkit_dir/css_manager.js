export function activate_module(lain) {

    lain.rom.manageCSS = () => {
        let customStyleSheet = null;
    
        const getOrCreateCustomStyleSheet = () => {
            if (!customStyleSheet) {
                const styleElement = document.createElement('style');
                document.head.appendChild(styleElement);
                customStyleSheet = styleElement.sheet;
            }
            return customStyleSheet;
        };

        const getCSSProperties = () => {
            var styleProperties = {};
            var styleSheets = document.styleSheets;
        
            // Collect styles from external and internal stylesheets
            // Collect styles from dynamically added stylesheets
for (var i = 0; i < styleSheets.length; i++) {
    var styleSheet = styleSheets[i];
    if (styleSheet.ownerNode && styleSheet.ownerNode.tagName === 'STYLE') {
        try {
            var cssRules = styleSheet.cssRules || styleSheet.rules;
            for (var j = 0; j < cssRules.length; j++) {
                var rule = cssRules[j];
                if (rule instanceof CSSStyleRule) {
                    var selectors = rule.selectorText.split(/\s*,\s*/);
                    selectors.forEach(function(selector) {
                        if (!styleProperties[selector]) {
                            styleProperties[selector] = {};
                        }
                        var styleDeclaration = rule.style;
                        for (var k = 0; k < styleDeclaration.length; k++) {
                            var property = styleDeclaration[k];
                            styleProperties[selector][property] = styleDeclaration.getPropertyValue(property);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Access to stylesheet ' + styleSheet.href + ' is denied.', error);
        }
    }
}
        
            // Collect inline styles only from elements with inline styles
            document.querySelectorAll('[style]').forEach((element, index) => {
                const uniqueSelector = `element-${index}`;
                element.setAttribute('data-style-id', uniqueSelector);
                if (!styleProperties[uniqueSelector]) {
                    styleProperties[uniqueSelector] = {};
                }
                var style = element.style;
                for (var i = 0; i < style.length; i++) {
                    var property = style[i];
                    styleProperties[uniqueSelector][property] = style.getPropertyValue(property);
                }
            });
        
            return styleProperties;
        };
    
        const modifyCSSProperty = (selector, property, value) => {
            if (selector === "body") {
                selector = "html body";
            }
            let ruleFound = false;
            for (let i = 0; i < document.styleSheets.length; i++) {
                const styleSheet = document.styleSheets[i];
                try {
                    const cssRules = styleSheet.cssRules || styleSheet.rules;
                    for (let j = 0; j < cssRules.length; j++) {
                        const rule = cssRules[j];
                        if (rule.selectorText === selector) {
                            rule.style[property] = value;
                            ruleFound = true;
                            break;
                        }
                    }
                } catch (error) {
                    console.warn('Could not access rules of stylesheet: ' + styleSheet.href, error);
                }
                if (ruleFound) break;
            }
            if (!ruleFound) {
                const customSheet = getOrCreateCustomStyleSheet();
                customSheet.insertRule(selector + ' { ' + property + ': ' + value + '; }', customSheet.cssRules.length);
            }
        };

        const applyStylesheet = (stylesheetObject) => {
            Object.entries(stylesheetObject).forEach(([selector, styles]) => {
                Object.entries(styles).forEach(([property, value]) => {
                    modifyCSSProperty(selector, property, value);
                });
            });
        };

        return {
            applyStylesheet,
            modifyCSSProperty,
            getCSSProperties
        };
    };
}