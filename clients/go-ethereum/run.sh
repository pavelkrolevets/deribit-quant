#!/usr/bin/env bash

tmux new -s "blockchain" -d &&
tmux send-keys -t "blockchain" "cd clients/go-ethereum/ &&rm -rf node1/geth/ &&geth --datadir node1/ init genesis.json" C-m &&
tmux send-keys -t "blockchain" "geth --datadir node1/ --syncmode full --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpccorsdomain '*' --rpcapi shh,personal,db,eth,net,web3,txpool,miner,admin --bootnodes enode://fd8b7d623070867bd0458369f5e9f6f4031d105fe559180719846d4a2a82f96d5a5cb987047e86b55b0dafcca786349173f18a3565db9d7ba8c2aecbdfd1ea8d@167.179.78.14:30310 --mine --verbosity 4 --shh --allow-insecure-unlock" C-m &&
tmux detach -s "blockchain"
