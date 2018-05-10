## Testing

Go to test/ subdirectory and run

``` bash
$ make env sample
$ node grade.js
```

Alternatively, to test a submission that doesn't compile, use

``` bash
$ make env sample-bad
$ node grade.js
```


## Security

Google's gVisor container runtime will be used to securely and effectively
sandbox student-submitted software.


## Potential Issues

The tarball must contain the Dockerfile at the root.
