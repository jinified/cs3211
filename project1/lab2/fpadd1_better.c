/* NUS - CS3211 AY2015/2016 Sem 2
 *
 * This program shows an accuracy issue when adding floating
 * point numbers 
 */

#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

int main(int argc, char **argv) {

	int i,j,k;
        long count=0;
	double a=0;

	printf("Adding 1 to 0, lots of times...\n");

        for (i=1; i<40; i++) {
	  for (j=1; j<=i; j++) {
	    for (k=1; k<=500000; k++) {
	      a=a+1;
              count=count+1;
	    }
	  }
          printf( "Adding %ld 1s to 0 gives this result: %10.1f\n", count, a);
          a=0;
          count=0;
	}

	return 0;
}
