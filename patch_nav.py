import os

file_path = 'd:/ECLIPSE 6.0/the website 2/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Navigation
nav_target = """<div class="hidden md:flex items-center gap-8 font-['Inter'] tracking-tight font-medium text-sm">
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors" href="#pricing">Pricing</a>
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors" href="#insights">Insights</a>
</div>"""

nav_replacement = """<div class="hidden md:flex items-center gap-8 font-['Inter'] tracking-tight font-medium text-sm">
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('home')">Home</a>
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('pricing')">Pricing</a>
<a class="text-[#e7e5e8]/60 hover:text-[#e7e5e8] transition-colors cursor-pointer" onclick="switchView('insights')">Insights</a>
</div>"""

html = html.replace(nav_target, nav_replacement)

# 2. Add SwitchView script at the bottom
script_injection = """
    window.switchView = function(viewId) {
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-pricing').classList.add('hidden');
        document.getElementById('view-insights').classList.add('hidden');
        document.getElementById('view-' + viewId).classList.remove('hidden');
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
</script>"""
html = html.replace("</script>", script_injection, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated nav correctly.")
