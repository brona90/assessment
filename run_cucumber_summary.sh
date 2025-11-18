#!/bin/bash
cd /workspace/assessment
npm run cucumber 2>&1 | tee /tmp/cucumber_full.txt
echo "=== SUMMARY ==="
grep -E "scenarios|steps" /tmp/cucumber_full.txt | tail -5