# Electron and Openfin Comparison: Throughput Testing

This repo is comprised of two standalone npm packages for running *Inter*-Process Windowing Messaging tests on Electron vs *Intra*-Procress Windowing Messaging tests in Openfin.

Both projects are set up to have a chain of windows pass a message around in a circle where each window reports back how long it took to recieve the message that it originally sent.
The size of the message and the number of windows are configurable. The latency and throughput of sending the messages are reported back as averages
