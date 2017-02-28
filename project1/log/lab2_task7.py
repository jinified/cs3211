#!/usr/bin/env python
import sys
import re
import pickle


def main(args):
    path = args[1]
    filename = path.split('.')[0]
    res = {}
    with open(path) as f:
        lines = f.readlines()
        for line in lines:
            size = re.findall("\d+", line)
            time = re.findall("\d+\.\d+", line)
            # [communication, computation]
            res[int(size[0])] = map(float, time)
    print(res)
    with open('{}.pkl'.format(filename), 'wb') as handle:
        pickle.dump(res, handle)


if __name__ == '__main__':
    main(sys.argv)
