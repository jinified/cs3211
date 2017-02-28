#!/usr/bin/env python
import sys
import re
import pickle


def main(args):
    path = args[1]
    filename = path.split('.')[0]
    n_threads = int(args[2])
    res = {k: [0]*n_threads for k in xrange(128, 1025)}
    key = 127
    index = -1
    with open(path) as f:
        lines = f.readlines()
        for line in lines[::2]:
            time = re.findall("\d+\.\d+", line)
            index = (index+1) % n_threads
            if index is 0:
                key = key + 1
            res[key][index] = float(time[0])
    with open('{}.pkl'.format(filename), 'wb') as handle:
        pickle.dump(res, handle)


if __name__ == '__main__':
    main(sys.argv)
