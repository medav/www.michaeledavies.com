
# Memory as seen by an Operating System

`Disclaimer:` This blog post (among others) is intended to be read by beginning or intermediate CS/SE/CprE students. Experienced programmers will probably find a lot of the definitions and details trivial but may still benefit from seeing the big picture.


# Let's talk about memory...

Almost every computer system in the world relies on this idea to function. Consider this piece of code:

~~~c
int foo(int * num) {
    int temp;
    temp = *num;
    return temp;
}
~~~

I want to pay special attention to this line:

~~~c
temp = *num;
~~~

The asterisk in this line is called the `dereference operator`. That's because it takes a memory address (a.k.a. the "reference") and resolves its value... hence, "de-referencing". When beginning programming, most students will learn about this sort of thing under the subject of pointers. Students will also be taught that memory looks something like this:

![User Memory](http://www.michaeledavies.com/pages/bits/assets/UserMemory.png)

But in reality, memory really looks more like this:

![System Memory](http://www.michaeledavies.com/pages/bits/assets/SystemMemory.png)


Let's talk about what really happens when you write a simple line of code to do a `dereference` operation.

# Physical Memory

First we need to go to the basics and talk about physical memory and how most OS's take care of it. On most modern systems memory is broken into chunks called `Pages`. For example, x86-64 largely uses 4kb pages. This describes the smallest allocate-able chunk of physical memory. This means even a 1 byte allocation will take at least 4KB of physical memory and the other 4095 bytes will sit there unused.

x86-64 (as well as most architectures) also allows for larger page sizes, usually 2MB and 1GB - there is a specific reason to this. To understand why these page sizes were decided on, we need take a look at a 64-bit memory address as viewed by an operating system:

![x86_64 Address Anatomy](http://www.michaeledavies.com/pages/bits/assets/x86_64-address-anatomy.png)

As you can see, an address to a 4KB page will have 52 bits for the `Page Frame Number` (PFN), and 12 bits (2^12 = 4096 bytes = 4KB) for the offset inside the page. When we talk about a page of physical memory, we refer to it as a `Page Frame`. This will become more important in a little bit. 

If we take 9 bits away from the page frame number and add it to the offset, we have 2MB page frames with 21 bit offsets and 43 bit PFNs. And if we take another 9 bits away we get 1GB pages with 30 bit offsets and 34 bit PFNs. There is also a reason for this, which we will get to soon.

# Virtual Memory

Let's step back a moment. When you've written a program and run the executable, the operating system (Windows, Linux, MacOSX, etc...) will create a `Virtual Address Space` for you. It quite literally is a address space created out of thin air* by the OS. Your program then has free reign over the whole* space.

***Not actually**

## Page Tables

The first thing the OS does to setup the virtual address space for your program is to create a `Page Table`. This is a data-structure that describes a mapping from a virtual address to a physical address. 

Recall our use of pages to chunk memory. A page table is simply a key-value store that relates a virtual (made up) address to a physical PFN and offset. There is a problem with this: page tables representing very large address spaces will grow to enormous sizes very quickly. For example, to represent 48-bit address space with 4KB pages, you would need 2^36 = 68,719,476,736 entries. If each takes up 8 bytes that's a 524 TB page table! 

![Simple Page Table](http://www.michaeledavies.com/pages/bits/assets/SimplePageTable.png)

The way to fix this is to intentionally **not** map the entire virtual address space. This is achieved through the use of multi-level page tables. The idea is that each table is responsible for a small portion of the address space. x86-64 commonly uses a 4-level page table that looks like this:

![4-Level Page Table](http://www.michaeledavies.com/pages/bits/assets/PageTableDataStructure.png)

The page table start with a single root page. For our x86-64 model, each table has 2^9 = 512 entries. Given a 48-bit address range, this means each entry corresponds to a 512GB of the virtual address range. In the likely case we don't use more than 512GB of RAM for a given address space, this means that we only have to use 1 out of the 512 entries, saving us the space required for the other 511 regions. 

**Why do we use 512 entry page tables?** This is out of convenience: given that each entry is 8 bytes, a 512 entry table will take exactly 4096 bytes, which is exactly one page of memory. This is also where the 9-bit division comes into play. Since 512 = 2^9, we require exactly 9 bits to address into a single page table level. 

If used, an entry in the root table will point to another page table with the exact same layout but one level down. This will correspond to another 9 bits of address space. In addition, we can leave entries in this table blank as well, saving us even more space. 

Continuing this process, we achieve 4 levels of page tables. The root is the 4th level, which controls 512GB regions of address space. The 3rd level controls 1GB regions of address space. The 2nd and 1st level page tables control 2MB and 4KB ranges, respectively.

**Why don't we have a 5th or 6th level to use all 64bits of hardware addressable space?** I don't know this for a fact but I am fairly certain this is simply because currently we don't have a computer system with anywhere close to 256TB of memory.

## The Memory Management Unit (MMU)

After an OS creates a page table representing the mapping, it asks the hardware for some help. Modern processors include hardware called a `Memory Management Unit`, or an MMU. The MMU and the OS work together to do some really cool stuff. Here's a nice diagram depicting where the MMU is in relation to the computer system:

![MMU Block Diagram](http://www.michaeledavies.com/pages/bits/assets/MMUBlockDiagram.png)

When in supervisor (kernel) mode, the OS can ask the MMU to load a page table. It does this by passing the physical address to the root page of the table created for your process. When the processor switches back into user mode to run your process, the MMU will transparently read the page table in the system memory to translate memory accesses from your program into system physical addresses.

Pretty cool, right?

## The Address Translation Process

Here's how the MMU then calculates the physical address for your variable based on the virtual address and the process page tables:

![MMU Block Diagram](http://www.michaeledavies.com/pages/bits/assets/address-translation.png)

First, the address is divided into the `9-9-9-9-12` format. The first group of nine bits is an index into the `Page Map Level 4` table. The resulting entry points to a `Page Directory Pointer Table`. The second group of nine bits indexes into this table, and so on. The resulting page table entry at the lowest level points to the base address of a 4kb page, to which the offset is added. The resulting addition is the translated address. This process is called a `Table Walk`.

This translation is performed by the MMU, accessing the RAM as needed to perform the table walk. Once the address is translated, the final translated page frame number (PFN) is associated with the 4 groups of nine bytes (the table indices).

## Translation Look-aside Buffers (TLBs)

In terms of runtime, table walks are very very expensive. To counter this, the MMU contains what's called a `Translation Look-aside Buffer`, or TLB. This is a special hardware cache that stores recent address translation results. Essentially, it stores a set of virtual/physical page pairs that were a result of earlier page walks. So when a new translation request is intercepted, the MMU will first look at the TLB to see if the translation was already computed. A nice property of the TLB is that the entire TLB can be searched in a single operation (potentially a few clock cycles) so it is extremely fast.

When a translation request is found in the TLB, this is called a `TLB hit`. If the request if not found, it is called a `TLB miss`. A TLB miss means that the MMU must go through the expensive process of performing a page table walk to determine the translation.

Special care has to be taken with TLBs because when the CPU updates a page table, it has to ensure that the MMU has not cached now invalid translations. The CPU must execute a TLB flush on the MMU in this case, causing the invalid translations to be removed from the TLB. This is done before returning to user mode so that no invalid memory access can happen.

# Some last bits
## Memory Paging Considerations

Today, the hard disk is often used as another level of data caching. When memory has been unused for a while and another process asks for some, the OS may decide to evict a page from DRAM and store it on the hard drive in a special file often called a `page file` or `swap file`. 

When the MMU translates a request to a page not currently in memory, it generates what's called a `Page Fault`. The MMU will generate an interrupt in these cases, switching the processor into kernel mode to perform the necessary actions of loading the needed page back into physical memory. It is up to the OS to decide how to manage the physical memory space and where to place it.

## Unmapped Entries / Access Violations

If a page table entry is empty or if it is marked as inaccessible, clearly the table walk will result in a failure. The MMU will also generate an interrupt in this case as an `Access Violation`. 

# Wrap Up

That's it! Now we know all the details of address translation (Minus caching). Here's what really happens when you dereference an address with `*num`:

![MMU Block Diagram](http://www.michaeledavies.com/pages/bits/assets/dereference-flowchart.png)

After the RAM receives the address, the data is loaded into the CPU and stored in the appropriate register.

**Fun Fact:** This is actually where a `segmentation fault` occurs. Most often a segmentation fault is caused by your program attempting to dereference a null (zero) pointer. The operating system rarely, if ever, will map the zero virtual page to your program and so as such, when the address is translated, the MMU will recognize this and treat is as an access violation. The operating system will usually respond by terminating your program immediately. 

# Conclusion

TL;DR: A lot happens when you dereference a variable. Take some time and consider just how many things have to go right just so you can load some data from memory.