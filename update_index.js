const fs = require('fs');
const execSync = require('child_process').execSync;
const file = 'd:/ECLIPSE 6.0/the website 2/index.html';
let content = fs.readFileSync(file, 'utf8');

// Replace Nav
content = content.replace(
  /<div class=\"hidden md:flex items-center gap-8 font-\['Inter'\] tracking-tight font-medium text-sm\">[\s\S]*?<\/div>/,
  `<div class="hidden md:flex items-center gap-8 font-['Inter'] tracking-tight font-medium text-sm">
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('home')">Home</a>
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('pricing')">Pricing</a>
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('insights')">Insights</a>
</div>`
);

// We need the OLD Home Content. I'll get it from Git HEAD~1
const oldFile = execSync('git show HEAD~1:index.html').toString();
const oldMatch = oldFile.match(/<!-- Hero Bento Grid \/ Cards -->([\s\S]*?)<\/main>/);
const oldHomeContent = oldMatch ? oldMatch[1] : ''; // Excludes </main>

// Wrap current Pricing and Insights
// They start with <!-- PRICING SECTION --> and end right before </main>
const currentSectionsMatch = content.match(/<!-- PRICING SECTION -->([\s\S]*?)<\/main>/);
const newPricingInsightsContent = currentSectionsMatch ? currentSectionsMatch[1] : ''; 

let pricingParts = newPricingInsightsContent.split('<!-- INSIGHTS SECTION -->');

let newLayout = `
<div id="view-home" class="view-section">
    <!-- Hero Bento Grid / Cards -->
    ${oldHomeContent}
</div>

<div id="view-pricing" class="view-section hidden">
    <!-- PRICING SECTION -->
    ${pricingParts[0]}
</div>

<div id="view-insights" class="view-section hidden">
    <!-- INSIGHTS SECTION -->
    ${pricingParts.length > 1 ? '<!-- INSIGHTS SECTION -->' + pricingParts[1] : ''}
</div>
</main>
`;

content = content.replace(/<!-- PRICING SECTION -->[\s\S]*?<\/main>/, newLayout);

// Add JS
content = content.replace('</script>', `
    window.switchView = function(viewId) {
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-pricing').classList.add('hidden');
        document.getElementById('view-insights').classList.add('hidden');
        document.getElementById('view-' + viewId).classList.remove('hidden');
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
</script>`);

fs.writeFileSync(file, content);
console.log('Successfully updated index.html with Tab UI and Git restored content!');
