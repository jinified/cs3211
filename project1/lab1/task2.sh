#!/usr/bin/bash

for i in {128..1024}
do
  for j in {1..8}
  do
    ./mm-shmem "$i" "$j" >> task2.log 2>&1;
  done
done

