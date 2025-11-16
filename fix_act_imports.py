#!/usr/bin/env python3

import re

# Read the test file
with open('src/App.test.jsx', 'r') as f:
    content = f.read()

# Replace remaining fireEvent calls with act wrapper
patterns = [
    # Pattern for fireEvent.click
    (r'(\s+)fireEvent\.click\(([^)]+)\);', 
     r'\1act(() => {\n\1  fireEvent.click(\2);\n\1 });'),
    
    # Pattern for fireEvent.change
    (r'(\s+)fireEvent\.change\(([^)]+)\);', 
     r'\1act(() => {\n\1  fireEvent.change(\2);\n\1 });'),
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content)

# Write back to file
with open('src/App.test.jsx', 'w') as f:
    f.write(content)

print("Fixed act() wrappers in test file")