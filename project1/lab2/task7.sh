#!/usr/bin/bash

for i in {8,16,24,32,40,48,56,64}
    do
        mpirun -machinefile machinefile.1 -np $i ./mm-mpi 2>&1 | tee "task7_$i.txt";
    done
