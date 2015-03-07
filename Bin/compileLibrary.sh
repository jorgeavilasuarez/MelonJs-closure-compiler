#!/bin/bash
python /home/jorge/drupal/web/closure-library/closure/bin/build/closurebuilder.py  \
--output_file="/home/jorge/drupal/web/MelonJS/jscompiled.js" \
--root="/home/jorge/drupal/web/MelonJS/Library/" \
--namespace="me" \
--compiler_jar="/home/jorge/drupal/web/MelonJS/Bin/compiler-latest/compiler.jar" \
--output_mode="compiled" \
--compiler_flags="--js=/home/jorge/drupal/web/MelonJS/Library/deps.js" \
--compiler_flags="--externs=/home/jorge/drupal/web/MelonJS/third_party/howlerjs/howler.js" \
--compiler_flags="--jscomp_off=externsValidation" \
--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
--compiler_flags="--warning_level=VERBOSE"