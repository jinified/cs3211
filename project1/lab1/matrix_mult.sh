#!/usr/bin/bash

N_THREADS=$1
LOG=$2

echo "Number of threads: " $N_THREADS;
echo "Log file: " $LOG;

for i in {128..1024}
do
  for j in $(seq 1 $N_THREADS)
  do
    ./mm-shmem "$i" "$j" >> $LOG 2>&1;
  done
done

echo "Completed";

