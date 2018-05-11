CC=g++
CFLAGS=-Wall -g -std=c++11
TARGET=a.out

all: payroll.o employee.o main.o
	$(CC) $^ -o $(TARGET)

%.o: %.cpp
	$(CC) $(CFLAGS) -c $^

clean:
	rm -rf *.o $(TARGET)

.PHONY: clean