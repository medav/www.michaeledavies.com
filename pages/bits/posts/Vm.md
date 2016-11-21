
# Memory as seen by an Operating System

`Disclaimer 1:` This blog post (among others) is intended to be read by beginning or intermediate CS/SE/CprE students. Experienced programmers will probably find a lot of the definitions and details trivial but may still benefit from seeing the big picture.

`Disclaimer 2:` In this post I discuss the topic of virtual memory. For the sake of not over-complicating things, I leave out the effects of the CPU cache.

`Disclaimer 3:` This is still in development. 

# Let's talk about memory...

Something I've become very familiar with over the last few months is the concept of virtual memory. Almost every computer system in the world relies on this idea to function. Consider this piece of code:

~~~c
int foo(int * num) {
    int temp;
    temp = *num;
    return temp;
}
~~~

For now, let's dismiss the complete uselessness of the function `foo()`. I want to pay special attention to this line:

~~~c
temp = *num;
~~~

The asterisk in this line is called the `dereference operator`. That's because it takes a memory address (a.k.a. the "reference") and resolves its value... hence, "de-referencing". When beginning programming, most students will learn about this sort of thing under the subject of pointers.

Beginning programming students will also be taught that memory looks something like this:

![User Memory](http://bits.michaeledavies.com/bits/assets/UserMemory.png)

But in reality, memory really looks like this:

![System Memory](http://bits.michaeledavies.com/bits/assets/SystemMemory.png)

*Please note:* This is still simplified from all the complicated mess that goes on. 

So let's talk about what really happens when you write a simple line of code to do a `dereference` operation.

# Physical Memory

First we need to go to the basics and talk about physical memory and how most OS's take care of it. On most modern systems memory is broken into chunks called `Pages`. A `Page` of memory usually is 4KB (for AMD64). This describes the smallest allocate-able chunk of physical memory. This means even a 1 byte allocation will take at least 4KB of physical memory and the other 4095 bytes will sit there unused. Do keep in mind that successive allocations may use free space in pages returned from pervious allocations.

AMD64 also allows for larger page sizes, usually 2MB and 1GB. This may seem arbitrary, but there is a specific reason to this. To understand why these page sizes were decided on, we need take a look at a 64-bit memory address as viewed by an operating system:

![x86_64 Address Anatomy](http://bits.michaeledavies.com/bits/assets/x86_64-address-anatomy.png)

As you can see, an address to a 4KB page will have 52 bits for the `Page Frame Number` (PFN), and 12 bits for the offset inside the page. When we talk about a page of physical memory, we refer to it as a `Page Frame`. This will become more important in a little bit. 

And of course, if we take 9 bits away from the page frame number and add it to the offset, we have 2MB page frames with 21 bit offsets and 43 bit PFNs. And if we take another 9 bits away we get 1GB pages with 30 bit offsets and 34 bit PFNs. 

Again, this is simply a way for the OS to organize the system RAM. Of course, if you have less that 2^64 bytes of RAM, there will be a "maximum" page frame number (PFN) that is addressable. So if you have 32GB of physical RAM, the maximum number of 4KB pages is 16,498,688.  

# Virtual Memory

When you've written a program, and run the executable, the operating system (Windows, Linux, MacOSX, etc...) will create a `Virtual Address Space` for you. This is different from the `System Physical Address Space` in that the addresses in your program are completely made up! 

# The Memory Map Unit (MMU)

The way this space is managed and used is something your program never sees or knows about, because the hardware and the operating system work together to do that. Your virtual address space is managed through something called a `Page Table` (more on this in a little bit) and when you do something like this:

~~~
temp = *num;
~~~

A special hardware unit called the `Memory Map Unit` (Commonly referred to as an `MMU`) will automatically translate the virtual address (Va) of `num` into a Physical Address (Pa). The MMU then carries out the transaction with the DRAM to retrieve the data from the physical address and place it where the core your program is running on can access.

![MMU Block Diagram](http://bits.michaeledavies.com/bits/assets/MMUBlockDiagram.png)

*Note:* This is a simplified view. There are many more things going on than just the MMU and DRAM. Almost every CPU today uses a multi-level cache to load and unload data from the DRAM into fast on-chip memory for quick access. I will leave this part out for now.

# Page Tables

So how does this virtual address thing work? Enter: `Page Tables`. These are magical data structures that define a mapping between a process's virtual address space and physical addresses. The most naive implementation would be a simple data structure that stores pairs of virtual pages and the physical page the map to:

![Simple Page Table](http://bits.michaeledavies.com/bits/assets/SimplePageTable.png)

What would happen on a memory reference, then, is the MMU will perform what's called a `Page Table Walk` to lookup the physical page number associated with the virtual address. It then puts that physical address on the bus and retrieves the correct memory for your program. 

Of course, there is a problem with this. Page tables representing very large address spaces will grow to enormous sizes very quickly. For example, to represent 48-bit address space with 4KB pages, you would need 2^36 = 68,719,476,736 entires. If each takes up 8 bytes that's a 524 TB page table! 

This is why we now use `Multi-level Page Tables`. In modern AMD64 based systems, it is common to use 4-level page tables where each level is responsible for 9 bits of address space. This way, we get our 4*9+12=48 bits accounted for. Here's a look at what this looks like:

// Graphic of 4-level page table

A nice consequence of the 9-bit division means that for tables with 64-bit entries, 2^9*8=4096 bytes for one page structure. This magically means that a single page structure fits into *exactly* one page of memory. This is very convenient for programming these things. On the flip side, some architectures support variable sized paging structures which really complicates things.

The way this saves memory, then, is that the table isn't completely filled out, nor does it have to be. When a process calls `malloc()`, some physical memory will be reserved for that allocation. In addition, the page structures for the process's virtual address space will be filled out to access that memory, creating an "on-demand" mapping. 

`Note:` Page structures do not have to be nice and fit into a single page. Some systems will allow for variable size page tables and the structures them selves can be as large or small as permitted by the hardware. AMD64 is nice though because it works well with the 9-9-9-9-12 format.

`Note:` This is where the "48-bit" address space limit comes from. In modern AMD64 systems, since the MMU supports only 4 level page tables, a process's virtual address space is only capable of addressing 48 bits of memory - which comes out to 256 TB. Near as I can tell: Intel, AMD, and the OS dev's decided that would be enough RAM for one process for the forseeable future.


# The Address Translation Process

Here's how the MMU then calculates the physical address for your variable based on the virtual address and the process page tables:

// Graphic of translation here


# Detailed Dereferencing (Part 1)

So we have these page tables made up, and we map some memory through them for a process. So now we can describe in detail what happens on the hardware to carry out this line of code:

~~~C
temp = *num;
~~~

1. The process will executes the memory load instruction
2. The MMU consumes the memory address of `num` and translates it to a physical address
3. The MMU will place that address on the bus and retrieve the data
4. The data is placed into `temp`


# Translation Look-aside Buffers (TLBs)

But wait, there's more! The MMU is a very sophisticated piece of hardware. It not only is capable of preforming the page table walks, but it also includes what's called a `Translation Look-aside Buffer`. This is a special hardware cache that stores address translation results. Essentially, it stores a set of virtual/physical page pairs that were a result of earlier page walks. So when a new translation request is intercepted, the MMU will first look at the TLB to see if the translation was already computed. A nice property of the TLB is that the entire TLB can be searched in a single operation (potentially a few clock cycles) so it is extremely fast.

// Graphic of the TLB

When a translation request is found in the TLB, this is called a `TLB hit`. If the request if not found, it is called a `TLB miss`. A TLB miss means that the MMU must go through the expensive process of performing a page table walk to determine the translation.

Special care has to be taken with TLBs because when the CPU updates a page table, it has to ensure that the MMU has not cached now invalid translations. The CPU must execute a TLB flush on the MMU in this case, causing the invalid translations to be removed from the TLB. 

Usually the flushing process can be done in such a way that valid translations remain, but some hardware implementations will cause `overflushing` to occur where some valid translations are also removed. This means those translations will cause a TLB miss the next time they are referenced.

Thankfully, most MMUs don't store translation requests that were invalid. So when `malloc()` is called and a new page table entry is added, often no TLB flush is needed.

`Note:` The flushing process is also often referred to as `TLB invalidation` or `TLB shootdown`.

# Memory Paging Considerations

Sometimes, in low memory situations, some pages of memory will be written to the hard disk (often called a `page file` or `swap file`). This means that when the MMU translates a request the page table entry may refer to a page that is not currently in memory. This is what is called a `Page Fault`, or some times a `Hard miss`. 

The MMU will generate an interrupt in these cases to the operating system to perform the necessary actions of loading the needed page back into physical memory. It is up to the OS to decide how to manage the physical memory space and where to place it.

# Detailed Dereferencing (part 2)

So now we know all the details of address translation. So here's what happens when you dereference an address with `*num`:

- The virtual address is passed to the MMU
- The MMU checks the TLB for the address

If the MMU has a TLB hit, the address is placed on the bus

- Otherwise the MMU performs the page table walk

If the page is in physical memory, the TLB is updated, and the address is placed on the bus

- Otherwise, the MMU issues an interrupt for the page fault
- The OS load the page into physical memory
- The MMU updates the TLB and places the address on the bus

After the RAM receives the address, the data is loaded into the CPU and stored in the appropriate variable.

# Conclusion

TL;DR: A lot happens when you dereference a variable. Take some time and consider just how many things have to happen just so you can load some data from memory.