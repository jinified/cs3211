#!/usr/bin/env
import re
import pickle
import csv
import matplotlib.pyplot as plt
import numpy as np

from collections import OrderedDict


def getFilename(path):
    return path.split('.')[0]


def read_pickle(path):
    with open(path) as f:
        return pickle.load(f)


def write_csv(path, data, headers):
    with open('{}.csv'.format(path), 'wb') as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(data.items())


def plotFixedTimeSpeedup(path, n_threads, size=[128, 256, 384, 512, 768, 1024]):
    data = read_pickle(path)
    largest_size = size[-2]
    serial_time = data[largest_size][0]  # Serial time for largest problem size
    speedup = [i / serial_time for i in data[largest_size]]
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.set_title('Fixed-time speedup')
    ax.set_xlabel("Number of threads")
    ax.set_ylabel("Speedup")
    ax.plot(range(1, n_threads+1), speedup)
    plt.xlim(xmin=1)
    plt.savefig('{}_fixedtime.png'.format(getFilename(path)))


def plotFixedSizeSpeedup(path, n_threads, size=[128, 256, 384, 512, 768, 1024]):
    data = read_pickle(path)
    largest_size = size[-1]
    serial_time = data[largest_size][0]  # Serial time for largest problem size
    speedup = [serial_time / i for i in data[largest_size]]
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.set_title('Fixed-size speedup')
    ax.set_xlabel("Number of threads")
    ax.set_ylabel("Speedup")
    ax.plot(range(1, n_threads+1), speedup)
    plt.xlim(xmin=1)
    plt.savefig('{}_fixedsize.png'.format(getFilename(path)))


def lab1_task3(path='lab1_task3.pkl'):
    plotFixedSizeSpeedup(path, 8)
    plotFixedTimeSpeedup(path, 8)


def lab1_task4(path='lab1_task4.pkl'):
    plotFixedSizeSpeedup(path, 40)
    plotFixedTimeSpeedup(path, 40)


def lab1_task6(path='lab1_task6.pkl'):
    data = OrderedDict(sorted(read_pickle(path).items()))
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.set_title('Array size vs time')
    ax.set_ylabel("Time (s)")
    ax.set_xlabel("Array size (kB)")
    ax.plot(data.keys(), data.values())
    plt.savefig('{}.png'.format(getFilename(path)))


def lab2_task3(path="lab2_1-4/lab2_task3.log"):
    data = {}
    with open(path) as f:
        lines = f.readlines()
        for line in lines:
            line = line.rstrip("\n\r")
            key, val = line.split(',')
            data[key] = val
        write_csv(getFilename(path), data, headers=['Order', 'Sum'])


def lab2_task4(path="lab2_1-4/lab2_task4.log"):
    """ Adding 10000 randomly genrated floating points using 24 threads """
    data = {}
    with open(path) as f:
        lines = f.readlines()
        for key, line in enumerate(lines):
            line = line.rstrip("\n\r")
            val = re.findall("\d+\.\d+", line)
            data[key+1] = val[0]
        write_csv(getFilename(path), data, headers=['Trial', 'Sum'])


def lab2_task12(path="lab2_1-4/lab2_task"):
    data1 = OrderedDict(sorted(read_pickle("{}1.pkl".format(path)).items()))
    data2 = OrderedDict(sorted(read_pickle("{}2.pkl".format(path)).items()))
    write_csv('{}1'.format(path), data1, headers=['Number of 1s', 'Sum'])
    write_csv('{}2'.format(path), data2, headers=['Number of 1s', 'Sum'])


def lab2_task7(path="lab2_task7/task7_"):
    comm = []
    comp = []
    xval = range(8, 65, 8)
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.set_title('Time vs Number of processes')
    ax.set_ylabel("Time (s)")
    ax.set_xlabel("Number of processes")
    for i in xval:
        data = read_pickle("{}{}.pkl".format(path, i))
        comm.append(np.mean([i[0] for i in data.values()]))
        comp.append(np.mean([i[1] for i in data.values()]))
    ax.plot(xval, comm, label='Communication time')
    ax.plot(xval, comp, label='Computation time')
    plt.legend(loc='upper right')
    plt.xlim(xmin=8)
    plt.savefig('{}.png'.format(getFilename(path)))


if __name__ == '__main__':
    # lab1_task3()
    # lab1_task4()
    # lab1_task6()
    # lab2_task7()
    lab2_task12()
    # lab2_task3()
    # lab2_task4()
