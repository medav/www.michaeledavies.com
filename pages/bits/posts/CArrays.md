## So I found this weird / cool way to do arrays in C...

Take a look at this code:

~~~C
struct _BYTE_ARRAY {
    unsigned long length;
    unsigned long capacity;
    
    unsigned char elements[];
}
~~~

I noticed something similar in another code base. It caught me off gaurd because usually the `[]` in C is filled in with a number, or the array is given an explicit initialization. But there's a cool trick this let's you do. When you allocate heap space for a struct, you usually do something like this:

~~~C
struct foo * f = (struct foo *) malloc( sizeof(struct foo) );
~~~

But with the above `_BYTE_ARRAY` struct, we can allocate *more* than the struct size and automagically, the `.elements` member will point to the start of the rest of the data allocated by the struct. For example, if we did this:

~~~C
struct _BYTE_ARRAY * arr;
arr = (struct _BYTE_ARRAY *) malloc(sizeof(arr) + some_length);
~~~

We will get back some bytes, with the elements looking like this:

<img src="/pages/bits/assets/carray.png" alt="Array structure" style="width: 100%"/>

This is pretty cool, because now we can pass around pointers to these arrays and they can carry with them their own length and capacity so other client code doesn't have to include extra parameters to keep track of that.

## Example program

~~~C
#include <stdio.h>
#include <stdlib.h>

// Here is a definition of our byte array
typedef struct _BYTE_ARRAY {
    unsigned long length;
    unsigned long capacity;
    
    unsigned char elements[];
} BYTE_ARRAY, *PBYTE_ARRAY;

int main() {
    PBYTE_ARRAY arr;
    int desired_length = 0;
    
    // Ask the user for the desired capacity
    printf("Desired length: ");
    scanf("%d", &desired_length);
    
    // Allocate a new array with that capacity
    arr = (PBYTE_ARRAY) malloc(sizeof(arr) + desired_length);
    arr->capacity = desired_length;
    
    // Ask the user for some data to put in that array
    printf("Input string: ");
    scanf("%s", arr->elements);
    arr->length = strlen((char *) arr->elements) + 1;
    
    // Dump the memory of the struct as hex
    printf("Data = /");
    
    for(int i = 0; i < sizeof(arr) + desired_length; i++) {
        printf("%.2x ", ((char *)arr)[i] );
    }
    
    printf("/\n");
    
    printf("length = %d \n", arr->length);
    printf("capacity = %d \n", arr->capacity);
    printf("data = %s \n", (char *)arr->elements);
    
    free(arr);
}
~~~

Here's output of the sample:

~~~
$ ./array_test
Desired length: 10
Input string: hello
Data = /06 00 00 00 0a 00 00 00 68 65 6c 6c 6f 00 6d 69 63 68 /
length = 6
capacity = 10
data = hello
~~~

This, of course, gives the first 4 bytes to `.length`, the next 4 to `.capacity` and the rest are an array pointed to by `.elements`.