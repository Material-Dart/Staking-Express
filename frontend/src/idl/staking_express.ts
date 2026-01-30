/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/staking_express.json`.
 */
export type StakingExpress = {
  "address": "E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy",
  "metadata": {
    "name": "stakingExpress",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Production-grade Solana staking protocol with bonus pools and referral system",
    "repository": "https://github.com/Material-Dart/Staking-Express"
  },
  "docs": [
    "Staking Express - Production-grade Solana staking protocol",
    "",
    "Economic Model:",
    "- 10% fee on stake/unstake: 700 BPS stakers, 100 BPS platform, 100 BPS bonus, 50 BPS referral, 50 BPS Material Dart",
    "- Bonus pool: 12h countdown, 15min extension per 1 SOL, 40/40/20 distribution",
    "- Referral pool: 30-day distribution, 50/50 split",
    "",
    "Architecture:",
    "- Uses PDAs for deterministic account addresses",
    "- Implements safe math to prevent overflow/underflow",
    "- Emits events for off-chain indexing",
    "- Custom error codes for debugging"
  ],
  "instructions": [
    {
      "name": "claimRewards",
      "docs": [
        "Claim accumulated staking rewards",
        "",
        "Transfers pending rewards to user (NO FEE on rewards).",
        "Updates reward debt to prevent double-claiming."
      ],
      "discriminator": [
        4,
        144,
        132,
        71,
        116,
        23,
        151,
        80
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "distributeBonusPool",
      "docs": [
        "Distribute bonus pool (callable by anyone when conditions met)",
        "",
        "Triggers when:",
        "- Countdown expires (12 hours), OR",
        "- 6 hours of inactivity",
        "",
        "Distribution:",
        "- 40% → Last 10 investors (pro-rata)",
        "- 40% → All stakers (via reward_per_share)",
        "- 20% → Carry forward to next round",
        "",
        "Countdown resets to 12 hours, last-10 list persists"
      ],
      "discriminator": [
        76,
        124,
        231,
        191,
        77,
        208,
        112,
        191
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Can be called by anyone when conditions are met"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "distributeReferralPool",
      "docs": [
        "Distribute referral pool (authority only)",
        "",
        "Triggers monthly (30 days) or can be forced by authority.",
        "",
        "Distribution:",
        "- 50% → All stakers (via reward_per_share)",
        "- 50% → Carry forward to next month"
      ],
      "discriminator": [
        92,
        189,
        16,
        94,
        164,
        233,
        211,
        97
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Authority only (admin-controlled)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "force",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the staking protocol",
        "",
        "Creates GlobalConfig, StakingPool, BonusPool, and ReferralPool accounts.",
        "Sets up authority, treasury, and Material Dart wallet."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Main staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool with countdown mechanism"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool for monthly distributions"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "materialDartWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "docs": [
        "Stake SOL into the pool",
        "",
        "Applies 10% fee:",
        "- 700 BPS → All stakers (via reward_per_share)",
        "- 100 BPS → Platform treasury",
        "- 100 BPS → Bonus pool",
        "- 50 BPS → Referrer or referral pool",
        "- 50 BPS → Material Dart team",
        "",
        "Extends bonus countdown +15min if stake >= 1 SOL",
        "Adds to last-10 circular buffer if stake >= 1 SOL"
      ],
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "materialDartWallet",
          "writable": true
        },
        {
          "name": "referrer",
          "docs": [
            "Optional referrer (if user was referred)"
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "grossAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "docs": [
        "Unstake SOL from the pool",
        "",
        "Applies 10% fee on unstake amount (identical to stake fee structure).",
        "Pending rewards are transferred separately WITHOUT fees."
      ],
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool (receives 100 BPS)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool (receives 50 BPS if no referrer)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "poolVault",
          "docs": [
            "Staking pool account (PDA, holds staker funds)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "materialDartWallet",
          "writable": true
        },
        {
          "name": "referrer",
          "docs": [
            "Optional referrer (if user was referred)"
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "grossAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bonusPool",
      "discriminator": [
        100,
        237,
        238,
        247,
        205,
        87,
        245,
        125
      ]
    },
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "referralPool",
      "discriminator": [
        166,
        15,
        69,
        116,
        22,
        34,
        158,
        186
      ]
    },
    {
      "name": "stakingPool",
      "discriminator": [
        203,
        19,
        214,
        220,
        220,
        154,
        24,
        102
      ]
    },
    {
      "name": "userStakeState",
      "discriminator": [
        249,
        182,
        149,
        175,
        99,
        149,
        92,
        103
      ]
    }
  ],
  "events": [
    {
      "name": "bonusCountdownExtended",
      "discriminator": [
        75,
        109,
        70,
        82,
        61,
        7,
        157,
        41
      ]
    },
    {
      "name": "bonusPoolExpired",
      "discriminator": [
        59,
        51,
        31,
        198,
        228,
        160,
        208,
        83
      ]
    },
    {
      "name": "investorAddedToLastTen",
      "discriminator": [
        210,
        232,
        3,
        164,
        186,
        169,
        23,
        149
      ]
    },
    {
      "name": "poolPauseToggled",
      "discriminator": [
        190,
        233,
        13,
        162,
        239,
        176,
        159,
        109
      ]
    },
    {
      "name": "protocolInitialized",
      "discriminator": [
        173,
        122,
        168,
        254,
        9,
        118,
        76,
        132
      ]
    },
    {
      "name": "referralPaid",
      "discriminator": [
        70,
        190,
        133,
        42,
        145,
        213,
        87,
        197
      ]
    },
    {
      "name": "referralPoolDistributed",
      "discriminator": [
        249,
        133,
        8,
        45,
        183,
        85,
        19,
        72
      ]
    },
    {
      "name": "rewardsClaimed",
      "discriminator": [
        75,
        98,
        88,
        18,
        219,
        112,
        88,
        121
      ]
    },
    {
      "name": "staked",
      "discriminator": [
        11,
        146,
        45,
        205,
        230,
        58,
        213,
        240
      ]
    },
    {
      "name": "unstaked",
      "discriminator": [
        27,
        179,
        156,
        215,
        47,
        71,
        195,
        7
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6001,
      "name": "mathUnderflow",
      "msg": "Arithmetic underflow occurred"
    },
    {
      "code": 6002,
      "name": "divisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6003,
      "name": "invalidCalculation",
      "msg": "Invalid calculation result"
    },
    {
      "code": 6004,
      "name": "stakeTooSmall",
      "msg": "Stake amount is below minimum (0.01 SOL)"
    },
    {
      "code": 6005,
      "name": "unstakeTooSmall",
      "msg": "Unstake amount is below minimum (0.01 SOL)"
    },
    {
      "code": 6006,
      "name": "insufficientStake",
      "msg": "Insufficient staked balance"
    },
    {
      "code": 6007,
      "name": "noRewardsAvailable",
      "msg": "No rewards available to claim"
    },
    {
      "code": 6008,
      "name": "invalidFeeBreakdown",
      "msg": "Invalid fee breakdown - components do not sum to 1000 BPS"
    },
    {
      "code": 6009,
      "name": "invalidAmount",
      "msg": "Invalid amount - must be greater than zero"
    },
    {
      "code": 6010,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6011,
      "name": "poolPaused",
      "msg": "Staking pool is paused"
    },
    {
      "code": 6012,
      "name": "bonusNotExpired",
      "msg": "Bonus pool countdown has not expired"
    },
    {
      "code": 6013,
      "name": "bonusPoolEmpty",
      "msg": "Bonus pool is empty"
    },
    {
      "code": 6014,
      "name": "referralPeriodNotEnded",
      "msg": "Referral pool distribution period has not ended"
    },
    {
      "code": 6015,
      "name": "noStakePosition",
      "msg": "User has no staked position"
    },
    {
      "code": 6016,
      "name": "totalStakedInvariantViolation",
      "msg": "Total staked invariant violated"
    },
    {
      "code": 6017,
      "name": "rewardPerShareInvariantViolation",
      "msg": "Reward per share invariant violated"
    },
    {
      "code": 6018,
      "name": "circularBufferFull",
      "msg": "Circular buffer is full"
    },
    {
      "code": 6019,
      "name": "unauthorized",
      "msg": "Unauthorized: caller is not the authority"
    },
    {
      "code": 6020,
      "name": "invalidAuthority",
      "msg": "Invalid authority account"
    },
    {
      "code": 6021,
      "name": "invalidTreasury",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6022,
      "name": "invalidMaterialDartWallet",
      "msg": "Invalid Material Dart wallet"
    },
    {
      "code": 6023,
      "name": "invalidPda",
      "msg": "Invalid PDA derivation"
    },
    {
      "code": 6024,
      "name": "alreadyInitialized",
      "msg": "Account already initialized"
    },
    {
      "code": 6025,
      "name": "notInitialized",
      "msg": "Account not initialized"
    },
    {
      "code": 6026,
      "name": "invalidAccountOwner",
      "msg": "Invalid account owner"
    }
  ],
  "types": [
    {
      "name": "bonusCountdownExtended",
      "docs": [
        "Event emitted when bonus countdown is extended"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "extendedBy",
            "type": "i64"
          },
          {
            "name": "newExpiry",
            "type": "i64"
          },
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bonusPool",
      "docs": [
        "Bonus pool with countdown mechanism",
        "PDA derived from [\"bonus_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakingPool",
            "docs": [
              "Staking pool this bonus pool belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance in bonus pool (lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "expiryTimestamp",
            "docs": [
              "Countdown expiry timestamp (12 hours initially)"
            ],
            "type": "i64"
          },
          {
            "name": "lastInvestmentTimestamp",
            "docs": [
              "Last investment timestamp (for 6-hour inactivity check)"
            ],
            "type": "i64"
          },
          {
            "name": "lastTenInvestors",
            "docs": [
              "Circular buffer: last 10 investors",
              "Only updated when deposit >= 1 SOL"
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "lastTenInvestor"
                  }
                },
                10
              ]
            }
          },
          {
            "name": "currentPosition",
            "docs": [
              "Current position in circular buffer (0-9)"
            ],
            "type": "u8"
          },
          {
            "name": "investorCount",
            "docs": [
              "Number of investors in buffer (0-10)"
            ],
            "type": "u8"
          },
          {
            "name": "totalParticipants",
            "docs": [
              "Total number of unique participants ever"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bonusPoolExpired",
      "docs": [
        "Event emitted when bonus pool expires and distributes"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDistributed",
            "type": "u64"
          },
          {
            "name": "toLastTen",
            "type": "u64"
          },
          {
            "name": "toAllStakers",
            "type": "u64"
          },
          {
            "name": "carriedForward",
            "type": "u64"
          },
          {
            "name": "lastTenCount",
            "type": "u8"
          },
          {
            "name": "countdownResetTo",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "globalConfig",
      "docs": [
        "Global configuration for the Staking Express protocol",
        "PDA derived from [\"global_config\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Protocol authority (can update settings)"
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "Treasury wallet for platform commission (100 BPS)"
            ],
            "type": "pubkey"
          },
          {
            "name": "materialDartWallet",
            "docs": [
              "Material Dart team wallet (50 BPS)"
            ],
            "type": "pubkey"
          },
          {
            "name": "paused",
            "docs": [
              "Whether the protocol is paused"
            ],
            "type": "bool"
          },
          {
            "name": "isInitialized",
            "docs": [
              "Whether the protocol is initialized"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investorAddedToLastTen",
      "docs": [
        "Event emitted when an investor is added to last-10 list"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "position",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "lastTenInvestor",
      "docs": [
        "Single entry in the last-10 circular buffer"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investor",
            "docs": [
              "Investor's public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "Amount staked (for pro-rata distribution)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poolPauseToggled",
      "docs": [
        "Event emitted when pool is paused/unpaused"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "protocolInitialized",
      "docs": [
        "Event emitted when the protocol is initialized"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "materialDartWallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "referralPaid",
      "docs": [
        "Event emitted when referral commission is paid"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "referee",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "referralPool",
      "docs": [
        "Referral pool for accumulating referral fees",
        "PDA derived from [\"referral_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakingPool",
            "docs": [
              "Staking pool this referral pool belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance in referral pool (lamports)",
              "Accumulates 50 BPS from users who join without referrer"
            ],
            "type": "u64"
          },
          {
            "name": "nextDistributionTimestamp",
            "docs": [
              "Next distribution timestamp (30 days from last distribution)"
            ],
            "type": "i64"
          },
          {
            "name": "lastDistributionTimestamp",
            "docs": [
              "Last distribution timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalDistributed",
            "docs": [
              "Total distributed so far"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "referralPoolDistributed",
      "docs": [
        "Event emitted when referral pool distributes monthly"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDistributed",
            "type": "u64"
          },
          {
            "name": "toStakers",
            "type": "u64"
          },
          {
            "name": "carriedForward",
            "type": "u64"
          },
          {
            "name": "nextDistribution",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rewardsClaimed",
      "docs": [
        "Event emitted when a user claims rewards"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "rewardDebtAfter",
            "type": "u128"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "staked",
      "docs": [
        "Event emitted when a user stakes SOL"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "grossAmount",
            "type": "u64"
          },
          {
            "name": "netAmount",
            "type": "u64"
          },
          {
            "name": "feeToStakers",
            "type": "u64"
          },
          {
            "name": "feeToPlatform",
            "type": "u64"
          },
          {
            "name": "feeToBonus",
            "type": "u64"
          },
          {
            "name": "feeToReferral",
            "type": "u64"
          },
          {
            "name": "feeToMaterialDart",
            "type": "u64"
          },
          {
            "name": "referrer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "totalStakedAfter",
            "type": "u64"
          },
          {
            "name": "rewardPerShareAfter",
            "type": "u128"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakingPool",
      "docs": [
        "Main staking pool state",
        "PDA derived from [\"staking_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "Global config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalStaked",
            "docs": [
              "Total amount of SOL staked (net of fees)"
            ],
            "type": "u64"
          },
          {
            "name": "rewardPerShare",
            "docs": [
              "Accumulated reward per share (scaled by REWARD_PRECISION = 1e12)",
              "Formula: reward_per_share += (fee_amount * REWARD_PRECISION) / total_staked"
            ],
            "type": "u128"
          },
          {
            "name": "lastUpdateTimestamp",
            "docs": [
              "Last timestamp when pool was updated"
            ],
            "type": "i64"
          },
          {
            "name": "totalStakers",
            "docs": [
              "Total number of unique stakers"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "unstaked",
      "docs": [
        "Event emitted when a user unstakes SOL"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "grossAmount",
            "type": "u64"
          },
          {
            "name": "netAmount",
            "type": "u64"
          },
          {
            "name": "rewardsClaimed",
            "type": "u64"
          },
          {
            "name": "feeToStakers",
            "type": "u64"
          },
          {
            "name": "feeToPlatform",
            "type": "u64"
          },
          {
            "name": "feeToBonus",
            "type": "u64"
          },
          {
            "name": "feeToReferral",
            "type": "u64"
          },
          {
            "name": "feeToMaterialDart",
            "type": "u64"
          },
          {
            "name": "totalStakedAfter",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userStakeState",
      "docs": [
        "User's individual staking position",
        "PDA derived from [\"user_stake\", user, staking_pool]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "Owner of this stake position"
            ],
            "type": "pubkey"
          },
          {
            "name": "pool",
            "docs": [
              "Staking pool this belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "stakedAmount",
            "docs": [
              "Amount of SOL staked (net amount after 10% fee)"
            ],
            "type": "u64"
          },
          {
            "name": "rewardDebt",
            "docs": [
              "Reward debt for reward calculation",
              "Formula: reward_debt = staked_amount * reward_per_share / REWARD_PRECISION",
              "Prevents double-claiming when stake changes"
            ],
            "type": "u128"
          },
          {
            "name": "stakeTimestamp",
            "docs": [
              "Timestamp when user first staked"
            ],
            "type": "i64"
          },
          {
            "name": "lastClaimTimestamp",
            "docs": [
              "Last timestamp when user claimed rewards"
            ],
            "type": "i64"
          },
          {
            "name": "referrer",
            "docs": [
              "Referrer address (if user was referred)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

export const IDL: StakingExpress = {
  "address": "E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy",
  "metadata": {
    "name": "stakingExpress",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Production-grade Solana staking protocol with bonus pools and referral system",
    "repository": "https://github.com/Material-Dart/Staking-Express"
  },
  "docs": [
    "Staking Express - Production-grade Solana staking protocol",
    "",
    "Economic Model:",
    "- 10% fee on stake/unstake: 700 BPS stakers, 100 BPS platform, 100 BPS bonus, 50 BPS referral, 50 BPS Material Dart",
    "- Bonus pool: 12h countdown, 15min extension per 1 SOL, 40/40/20 distribution",
    "- Referral pool: 30-day distribution, 50/50 split",
    "",
    "Architecture:",
    "- Uses PDAs for deterministic account addresses",
    "- Implements safe math to prevent overflow/underflow",
    "- Emits events for off-chain indexing",
    "- Custom error codes for debugging"
  ],
  "instructions": [
    {
      "name": "claimRewards",
      "docs": [
        "Claim accumulated staking rewards",
        "",
        "Transfers pending rewards to user (NO FEE on rewards).",
        "Updates reward debt to prevent double-claiming."
      ],
      "discriminator": [
        4,
        144,
        132,
        71,
        116,
        23,
        151,
        80
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "distributeBonusPool",
      "docs": [
        "Distribute bonus pool (callable by anyone when conditions met)",
        "",
        "Triggers when:",
        "- Countdown expires (12 hours), OR",
        "- 6 hours of inactivity",
        "",
        "Distribution:",
        "- 40% → Last 10 investors (pro-rata)",
        "- 40% → All stakers (via reward_per_share)",
        "- 20% → Carry forward to next round",
        "",
        "Countdown resets to 12 hours, last-10 list persists"
      ],
      "discriminator": [
        76,
        124,
        231,
        191,
        77,
        208,
        112,
        191
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Can be called by anyone when conditions are met"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "distributeReferralPool",
      "docs": [
        "Distribute referral pool (authority only)",
        "",
        "Triggers monthly (30 days) or can be forced by authority.",
        "",
        "Distribution:",
        "- 50% → All stakers (via reward_per_share)",
        "- 50% → Carry forward to next month"
      ],
      "discriminator": [
        92,
        189,
        16,
        94,
        164,
        233,
        211,
        97
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Authority only (admin-controlled)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "force",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the staking protocol",
        "",
        "Creates GlobalConfig, StakingPool, BonusPool, and ReferralPool accounts.",
        "Sets up authority, treasury, and Material Dart wallet."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Main staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool with countdown mechanism"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool for monthly distributions"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "materialDartWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "docs": [
        "Stake SOL into the pool",
        "",
        "Applies 10% fee:",
        "- 700 BPS → All stakers (via reward_per_share)",
        "- 100 BPS → Platform treasury",
        "- 100 BPS → Bonus pool",
        "- 50 BPS → Referrer or referral pool",
        "- 50 BPS → Material Dart team",
        "",
        "Extends bonus countdown +15min if stake >= 1 SOL",
        "Adds to last-10 circular buffer if stake >= 1 SOL"
      ],
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "materialDartWallet",
          "writable": true
        },
        {
          "name": "referrer",
          "docs": [
            "Optional referrer (if user was referred)"
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "grossAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "docs": [
        "Unstake SOL from the pool",
        "",
        "Applies 10% fee on unstake amount (identical to stake fee structure).",
        "Pending rewards are transferred separately WITHOUT fees."
      ],
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "docs": [
            "Global configuration"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stakingPool",
          "docs": [
            "Staking pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userStake",
          "docs": [
            "User's stake state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "stakingPool"
              }
            ]
          }
        },
        {
          "name": "bonusPool",
          "docs": [
            "Bonus pool (receives 100 BPS)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  117,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "referralPool",
          "docs": [
            "Referral pool (receives 50 BPS if no referrer)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "poolVault",
          "docs": [
            "Staking pool account (PDA, holds staker funds)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "materialDartWallet",
          "writable": true
        },
        {
          "name": "referrer",
          "docs": [
            "Optional referrer (if user was referred)"
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "grossAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bonusPool",
      "discriminator": [
        100,
        237,
        238,
        247,
        205,
        87,
        245,
        125
      ]
    },
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "referralPool",
      "discriminator": [
        166,
        15,
        69,
        116,
        22,
        34,
        158,
        186
      ]
    },
    {
      "name": "stakingPool",
      "discriminator": [
        203,
        19,
        214,
        220,
        220,
        154,
        24,
        102
      ]
    },
    {
      "name": "userStakeState",
      "discriminator": [
        249,
        182,
        149,
        175,
        99,
        149,
        92,
        103
      ]
    }
  ],
  "events": [
    {
      "name": "bonusCountdownExtended",
      "discriminator": [
        75,
        109,
        70,
        82,
        61,
        7,
        157,
        41
      ]
    },
    {
      "name": "bonusPoolExpired",
      "discriminator": [
        59,
        51,
        31,
        198,
        228,
        160,
        208,
        83
      ]
    },
    {
      "name": "investorAddedToLastTen",
      "discriminator": [
        210,
        232,
        3,
        164,
        186,
        169,
        23,
        149
      ]
    },
    {
      "name": "poolPauseToggled",
      "discriminator": [
        190,
        233,
        13,
        162,
        239,
        176,
        159,
        109
      ]
    },
    {
      "name": "protocolInitialized",
      "discriminator": [
        173,
        122,
        168,
        254,
        9,
        118,
        76,
        132
      ]
    },
    {
      "name": "referralPaid",
      "discriminator": [
        70,
        190,
        133,
        42,
        145,
        213,
        87,
        197
      ]
    },
    {
      "name": "referralPoolDistributed",
      "discriminator": [
        249,
        133,
        8,
        45,
        183,
        85,
        19,
        72
      ]
    },
    {
      "name": "rewardsClaimed",
      "discriminator": [
        75,
        98,
        88,
        18,
        219,
        112,
        88,
        121
      ]
    },
    {
      "name": "staked",
      "discriminator": [
        11,
        146,
        45,
        205,
        230,
        58,
        213,
        240
      ]
    },
    {
      "name": "unstaked",
      "discriminator": [
        27,
        179,
        156,
        215,
        47,
        71,
        195,
        7
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6001,
      "name": "mathUnderflow",
      "msg": "Arithmetic underflow occurred"
    },
    {
      "code": 6002,
      "name": "divisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6003,
      "name": "invalidCalculation",
      "msg": "Invalid calculation result"
    },
    {
      "code": 6004,
      "name": "stakeTooSmall",
      "msg": "Stake amount is below minimum (0.01 SOL)"
    },
    {
      "code": 6005,
      "name": "unstakeTooSmall",
      "msg": "Unstake amount is below minimum (0.01 SOL)"
    },
    {
      "code": 6006,
      "name": "insufficientStake",
      "msg": "Insufficient staked balance"
    },
    {
      "code": 6007,
      "name": "noRewardsAvailable",
      "msg": "No rewards available to claim"
    },
    {
      "code": 6008,
      "name": "invalidFeeBreakdown",
      "msg": "Invalid fee breakdown - components do not sum to 1000 BPS"
    },
    {
      "code": 6009,
      "name": "invalidAmount",
      "msg": "Invalid amount - must be greater than zero"
    },
    {
      "code": 6010,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    },
    {
      "code": 6011,
      "name": "poolPaused",
      "msg": "Staking pool is paused"
    },
    {
      "code": 6012,
      "name": "bonusNotExpired",
      "msg": "Bonus pool countdown has not expired"
    },
    {
      "code": 6013,
      "name": "bonusPoolEmpty",
      "msg": "Bonus pool is empty"
    },
    {
      "code": 6014,
      "name": "referralPeriodNotEnded",
      "msg": "Referral pool distribution period has not ended"
    },
    {
      "code": 6015,
      "name": "noStakePosition",
      "msg": "User has no staked position"
    },
    {
      "code": 6016,
      "name": "totalStakedInvariantViolation",
      "msg": "Total staked invariant violated"
    },
    {
      "code": 6017,
      "name": "rewardPerShareInvariantViolation",
      "msg": "Reward per share invariant violated"
    },
    {
      "code": 6018,
      "name": "circularBufferFull",
      "msg": "Circular buffer is full"
    },
    {
      "code": 6019,
      "name": "unauthorized",
      "msg": "Unauthorized: caller is not the authority"
    },
    {
      "code": 6020,
      "name": "invalidAuthority",
      "msg": "Invalid authority account"
    },
    {
      "code": 6021,
      "name": "invalidTreasury",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6022,
      "name": "invalidMaterialDartWallet",
      "msg": "Invalid Material Dart wallet"
    },
    {
      "code": 6023,
      "name": "invalidPda",
      "msg": "Invalid PDA derivation"
    },
    {
      "code": 6024,
      "name": "alreadyInitialized",
      "msg": "Account already initialized"
    },
    {
      "code": 6025,
      "name": "notInitialized",
      "msg": "Account not initialized"
    },
    {
      "code": 6026,
      "name": "invalidAccountOwner",
      "msg": "Invalid account owner"
    }
  ],
  "types": [
    {
      "name": "bonusCountdownExtended",
      "docs": [
        "Event emitted when bonus countdown is extended"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "extendedBy",
            "type": "i64"
          },
          {
            "name": "newExpiry",
            "type": "i64"
          },
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bonusPool",
      "docs": [
        "Bonus pool with countdown mechanism",
        "PDA derived from [\"bonus_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakingPool",
            "docs": [
              "Staking pool this bonus pool belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance in bonus pool (lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "expiryTimestamp",
            "docs": [
              "Countdown expiry timestamp (12 hours initially)"
            ],
            "type": "i64"
          },
          {
            "name": "lastInvestmentTimestamp",
            "docs": [
              "Last investment timestamp (for 6-hour inactivity check)"
            ],
            "type": "i64"
          },
          {
            "name": "lastTenInvestors",
            "docs": [
              "Circular buffer: last 10 investors",
              "Only updated when deposit >= 1 SOL"
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "lastTenInvestor"
                  }
                },
                10
              ]
            }
          },
          {
            "name": "currentPosition",
            "docs": [
              "Current position in circular buffer (0-9)"
            ],
            "type": "u8"
          },
          {
            "name": "investorCount",
            "docs": [
              "Number of investors in buffer (0-10)"
            ],
            "type": "u8"
          },
          {
            "name": "totalParticipants",
            "docs": [
              "Total number of unique participants ever"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bonusPoolExpired",
      "docs": [
        "Event emitted when bonus pool expires and distributes"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDistributed",
            "type": "u64"
          },
          {
            "name": "toLastTen",
            "type": "u64"
          },
          {
            "name": "toAllStakers",
            "type": "u64"
          },
          {
            "name": "carriedForward",
            "type": "u64"
          },
          {
            "name": "lastTenCount",
            "type": "u8"
          },
          {
            "name": "countdownResetTo",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "globalConfig",
      "docs": [
        "Global configuration for the Staking Express protocol",
        "PDA derived from [\"global_config\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Protocol authority (can update settings)"
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "Treasury wallet for platform commission (100 BPS)"
            ],
            "type": "pubkey"
          },
          {
            "name": "materialDartWallet",
            "docs": [
              "Material Dart team wallet (50 BPS)"
            ],
            "type": "pubkey"
          },
          {
            "name": "paused",
            "docs": [
              "Whether the protocol is paused"
            ],
            "type": "bool"
          },
          {
            "name": "isInitialized",
            "docs": [
              "Whether the protocol is initialized"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investorAddedToLastTen",
      "docs": [
        "Event emitted when an investor is added to last-10 list"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "position",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "lastTenInvestor",
      "docs": [
        "Single entry in the last-10 circular buffer"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investor",
            "docs": [
              "Investor's public key"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "Amount staked (for pro-rata distribution)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poolPauseToggled",
      "docs": [
        "Event emitted when pool is paused/unpaused"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "protocolInitialized",
      "docs": [
        "Event emitted when the protocol is initialized"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "materialDartWallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "referralPaid",
      "docs": [
        "Event emitted when referral commission is paid"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "referee",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "referralPool",
      "docs": [
        "Referral pool for accumulating referral fees",
        "PDA derived from [\"referral_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakingPool",
            "docs": [
              "Staking pool this referral pool belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance in referral pool (lamports)",
              "Accumulates 50 BPS from users who join without referrer"
            ],
            "type": "u64"
          },
          {
            "name": "nextDistributionTimestamp",
            "docs": [
              "Next distribution timestamp (30 days from last distribution)"
            ],
            "type": "i64"
          },
          {
            "name": "lastDistributionTimestamp",
            "docs": [
              "Last distribution timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalDistributed",
            "docs": [
              "Total distributed so far"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "referralPoolDistributed",
      "docs": [
        "Event emitted when referral pool distributes monthly"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDistributed",
            "type": "u64"
          },
          {
            "name": "toStakers",
            "type": "u64"
          },
          {
            "name": "carriedForward",
            "type": "u64"
          },
          {
            "name": "nextDistribution",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rewardsClaimed",
      "docs": [
        "Event emitted when a user claims rewards"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "rewardDebtAfter",
            "type": "u128"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "staked",
      "docs": [
        "Event emitted when a user stakes SOL"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "grossAmount",
            "type": "u64"
          },
          {
            "name": "netAmount",
            "type": "u64"
          },
          {
            "name": "feeToStakers",
            "type": "u64"
          },
          {
            "name": "feeToPlatform",
            "type": "u64"
          },
          {
            "name": "feeToBonus",
            "type": "u64"
          },
          {
            "name": "feeToReferral",
            "type": "u64"
          },
          {
            "name": "feeToMaterialDart",
            "type": "u64"
          },
          {
            "name": "referrer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "totalStakedAfter",
            "type": "u64"
          },
          {
            "name": "rewardPerShareAfter",
            "type": "u128"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakingPool",
      "docs": [
        "Main staking pool state",
        "PDA derived from [\"staking_pool\"]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "Global config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalStaked",
            "docs": [
              "Total amount of SOL staked (net of fees)"
            ],
            "type": "u64"
          },
          {
            "name": "rewardPerShare",
            "docs": [
              "Accumulated reward per share (scaled by REWARD_PRECISION = 1e12)",
              "Formula: reward_per_share += (fee_amount * REWARD_PRECISION) / total_staked"
            ],
            "type": "u128"
          },
          {
            "name": "lastUpdateTimestamp",
            "docs": [
              "Last timestamp when pool was updated"
            ],
            "type": "i64"
          },
          {
            "name": "totalStakers",
            "docs": [
              "Total number of unique stakers"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "unstaked",
      "docs": [
        "Event emitted when a user unstakes SOL"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "grossAmount",
            "type": "u64"
          },
          {
            "name": "netAmount",
            "type": "u64"
          },
          {
            "name": "rewardsClaimed",
            "type": "u64"
          },
          {
            "name": "feeToStakers",
            "type": "u64"
          },
          {
            "name": "feeToPlatform",
            "type": "u64"
          },
          {
            "name": "feeToBonus",
            "type": "u64"
          },
          {
            "name": "feeToReferral",
            "type": "u64"
          },
          {
            "name": "feeToMaterialDart",
            "type": "u64"
          },
          {
            "name": "totalStakedAfter",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userStakeState",
      "docs": [
        "User's individual staking position",
        "PDA derived from [\"user_stake\", user, staking_pool]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "Owner of this stake position"
            ],
            "type": "pubkey"
          },
          {
            "name": "pool",
            "docs": [
              "Staking pool this belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "stakedAmount",
            "docs": [
              "Amount of SOL staked (net amount after 10% fee)"
            ],
            "type": "u64"
          },
          {
            "name": "rewardDebt",
            "docs": [
              "Reward debt for reward calculation",
              "Formula: reward_debt = staked_amount * reward_per_share / REWARD_PRECISION",
              "Prevents double-claiming when stake changes"
            ],
            "type": "u128"
          },
          {
            "name": "stakeTimestamp",
            "docs": [
              "Timestamp when user first staked"
            ],
            "type": "i64"
          },
          {
            "name": "lastClaimTimestamp",
            "docs": [
              "Last timestamp when user claimed rewards"
            ],
            "type": "i64"
          },
          {
            "name": "referrer",
            "docs": [
              "Referrer address (if user was referred)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
