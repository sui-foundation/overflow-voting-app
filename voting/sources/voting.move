
/// Module: voting
module voting::voting {
  use std::string;
  use sui::table;
  use sui::vec_map;
  use sui::url;
  use sui::zklogin_verified_issuer::check_zklogin_issuer;

  const EInvalidProof: u64 = 1;
  const EUserAlreadyVoted: u64 = 2;
  const ETooManyVotes: u64 = 3;
  const EInvalidProjectId: u64 = 4;
  const EVotingInactive: u64 = 5;

  public struct Votes has key {
    id: UID, 
    total_votes: u64, 
    project_list: vector<Project>,
    votes: table::Table<address, vector<u64>>,
    voting_active: bool
  }

  public struct Project has store {
    id: u64,
    name: string::String, 
    // description: string::String, 
    air_table_url: url::Url,
    /* 
    logo: ...,
    video: ..., 
    ...
    */
    votes: u64
  }

  public struct AdminCap has key, store {
    id: UID
  }

  fun init(ctx: &mut TxContext) {
    let votes = Votes {
      id: object::new(ctx),
      total_votes: 0, 
      project_list: vector[
        Project {
          id: 0, 
          name: b"Aalps Protocol".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recI6k3PRC0113wDh"),
          votes: 0
        },
        Project{
          id: 1, 
          name: b"AdToken".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recd95WbIXs5qiLmM"),
          votes: 0
        },
        Project {
          id: 2, 
          name: b"Aeon".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recJHliYSNdxFXdCB"), 
          votes: 0
        },
        Project {
          id: 3, 
          name: b"AresRPG".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recg4WFsxsqg5toWO"),
          votes: 0, 
        },
        Project {
          id: 4, 
          name: b"BioWallet".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reckESZUYtBGNGYJv"),
          votes: 0
        }, 
        Project {
          id: 5, 
          name: b"BitsLab IDE".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recvjB1DqQ7nZk2Wi"),
          votes: 0
        },
        Project {
          id: 6, 
          name: b"BullNow".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recrtOfluU0YewQqy"),
          votes: 0
        },
        Project {
          id: 7, 
          name: b"CLMM and Deepbook Market Making Vaulta".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recHgBwMFvFqb44l4"),
          votes: 0
        },
        Project {
          id: 8, 
          name: b"DegenHive".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recU3KMJmEed1G3eX"),
          votes: 0
        },
        Project {
          id: 9, 
          name: b"DoubleUp".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recFNsX6mqTpFX7MU"),
          votes: 0
        },
        Project {
          id: 10, 
          name: b"FlowX Finance - Aggregator".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recrZw4nvCIEOk6Oc"),
          votes: 0
        },
        Project {
          id: 11, 
          name: b"FoMoney".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recbTl14o86LXncUh"),
          votes: 0
        },
        Project {
          id: 12, 
          name: b"Fren Suipport".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recauWVk8gOWZhIHC"),
          votes: 0
        },
        Project {
          id: 13, 
          name: b"Goose Bumps".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recCKdwv2R7o90joP"),
          votes: 0
        },
        Project {
          id: 14, 
          name: b"Hakifi".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recKN9qyw3Io9DJGK"),
          votes: 0
        },
        Project {
          id: 15, 
          name: b"HexCapsule".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recoZ80nWldHy1Yh9"),
          votes: 0
        },
        Project {
          id: 16, 
          name: b"Homeless Hold'Em".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recsXgqOFnaB2SyCn"),
          votes: 0
        },
        Project {
          id: 17, 
          name: b"Hop Aggregator".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recrGCCis3ycjrrlq"),
          votes: 0
        },
        Project {
          id: 18, 
          name: b"Infinite Seas".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reckKAAvvIxwPZkYt"),
          votes: 0
        },
        Project {
          id: 19, 
          name: b"Kraken".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reciO3NPs5PuOGdOL"),
          votes: 0
        },
        Project {
          id: 20, 
          name: b"Kriya Credit".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recuCDmPfu8cjDNmG"),
          votes: 0
        },
        Project {
          id: 21, 
          name: b"Legato LBP".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/rec3HkYzRDSRqz5VY"),
          votes: 0
        },
        Project {
          id: 22, 
          name: b"LePoker".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recLsiw1viXM0g3Hs"),
          votes: 0
        },
        Project {
          id: 23, 
          name: b"Liquidity Garden".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recKhCUHnR2IWbN9J"),
          votes: 0
        },
        Project {
          id: 24, 
          name: b"LiquidLink".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recvPTjIbgBiKWzSu"),
          votes: 0
        },
        Project {
          id: 25, 
          name: b"Mineral".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recBQgTWtev3w612b"),
          votes: 0
        },
        Project {
          id: 26, 
          name: b"Mrc20protocol".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/rec9bM1r25BWGpFsK"),
          votes: 0
        },
        Project {
          id: 27, 
          name: b"Multichain Meme Creator".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recPHKpqDVrzcVKhN"),
          votes: 0
        },
        Project {
          id: 28, 
          name: b"Mystic Tarot".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recPQKiqo3VkWRTRL"),
          votes: 0
        },
        Project {
          id: 29, 
          name: b"Nimbus".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recH3VDKgDJUKXD6n"),
          votes: 0
        },
        Project {
          id: 30, 
          name: b"Orbital".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recxUMdUND0Zet9vZ"),
          votes: 0
        },
        Project {
          id: 31, 
          name: b"Pandora Finance".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recfftSBFjh5xJ4WW"),
          votes: 0
        },
        Project {
          id: 32, 
          name: b"Panther Wallet".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recK5alei9zoP6TWQ"),
          votes: 0
        },
        Project {
          id: 33, 
          name: b"PinataBot".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reciiS1VdHm79jQen"),
          votes: 0
        },
        Project {
          id: 34, 
          name: b"Private Transaction In Sui".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/rec20Bf40XfZOALKe"),
          votes: 0
        },
        Project {
          id: 35,
          name: b"Promise".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recvPpoJ7S4a6HcSv"),
          votes: 0
        },
        Project {
          id: 36, 
          name: b"Pump Up".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reckEQHRGv0PBS59U"),
          votes: 0
        },
        Project {
          id: 37, 
          name: b"Scam NFT detector".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recZrGwhqB9G0n8JQ"),
          votes: 0
        },
        Project {
          id: 38, 
          name: b"Shall We Move".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recrywtw02M5hv8O9"),
          votes: 0
        },
        Project {
          id: 39, 
          name: b"Shio".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recmgC1zo9IOpAN5w"),
          votes: 0
        },
        Project {
          id: 40, 
          name: b"Stashdrop".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recdSD9K7cJJpuMSJ"),
          votes: 0
        },
        Project {
          id: 41, 
          name: b"Stoked Finance".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recgIl4rt4WHly2KI"),
          votes: 0
        },
        Project {
          id: 42, 
          name: b"stream.gift".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reciwLIeAnDPYP3Re"),
          votes: 0
        },
        Project {
          id: 43, 
          name: b"Su Protocol".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recljFHxXfqoXm3iy"),
          votes: 0
        },
        Project {
          id: 44, 
          name: b"Sui dApp Starter".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recSc0FFQKTUMRnVP"),
          votes: 0
        },
        Project {
          id: 45, 
          name: b"Sui Metadata".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recyoA0rNYXWEgR9D"),
          votes: 0
        },
        Project {
          id: 46, 
          name: b"Sui simulator".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recZEsvZjI6WPymp0"),
          votes: 0
        },
        Project {
          id: 47, 
          name: b"sui-wormhole-native-token-transfer".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recCUvcinQxZDrqPH"),
          votes: 0
        },
        Project {
          id: 48, 
          name: b"SuiAutochess".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recFfGGW7lj69skWu"),
          votes: 0
        },
        Project {
          id: 49, 
          name: b"SuiFund".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recSqeDr8i1isZSeW"),
          votes: 0
        },
        Project {
          id: 50, 
          name: b"SuiGPT".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recxqubMauRZEnM08"),
          votes: 0
        },
        Project {
          id: 51, 
          name: b"SuiMate".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recBmhSGqbeh0wbHz"),
          votes: 0
        },
        Project {
          id: 52, 
          name: b"Suinfra – RPC Metrics Dashboard & Geo-Aware RPC Endpoint".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recPnt2C1pUf7wA67"),
          votes: 0
        },
        Project {
          id: 53, 
          name: b"SuiPass".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recJtsRwUqgYDUVRx"),
          votes: 0
        },
        Project {
          id: 54, 
          name: b"SuiSec Toolkit".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recwJ8YLkGYs9uaQY"),
          votes: 0
        },
        Project {
          id: 55, 
          name: b"SuiWeb".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reckOMVr5hHVCKQ5V"),
          votes: 0
        },
        Project {
          id: 56, 
          name: b"Summon Attack".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recnfbfOpSf15xmbB"),
          votes: 0
        },
        Project {
          id: 57, 
          name: b"The Wanderer".to_string(), 
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recamukcsSBjjcLBH"),
          votes: 0
        },
        Project {
          id: 58, 
          name: b"Trippple".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/rec1rXKOir9Zsk4LF"),
          votes: 0
        },
        Project {
          id: 59, 
          name: b"Wagmi Kitchen".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/reck0jOTWX9IbLDj0"),
          votes: 0
        },
        Project {
          id: 60, 
          name: b"Wave Wallet".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recXVLwFaHcnjJx8e"),
          votes: 0
        },
        Project {
          id: 61, 
          name: b"WebAuthn on SUI".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recD2ObsLZiblm1Dd"),
          votes: 0
        },
        Project {
          id: 62, 
          name: b"Wecastle".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recJ7NgQTZBa8B7Rw"),
          votes: 0
        },
        Project {
          id: 63, 
          name: b"wormhole-kit".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recN7oF15sUwAaSGi"),
          votes: 0
        },
        Project {
          id: 64, 
          name: b"zk Reputation".to_string(),
          air_table_url: url::new_unsafe_from_bytes(b"https://airtable.com/appInEqjBZ2YxoHgS/shrmgnQKAXwCnv4NY/tblJaA1KCQXwgcHtU/viwsKAEf1fDL8T6cS/recUDylUiyWglTJaP"),
          votes: 0
        },
        
      ],
      votes: table::new(ctx),
      voting_active: false
    };
    transfer::share_object(votes);

    transfer::transfer(
      AdminCap {
        id: object::new(ctx)
      }, 
      ctx.sender()
    );
  }

  public fun vote(project_ids: vector<u64>, votes: &mut Votes, address_seed: u256, ctx: &TxContext) {

    let voter = ctx.sender();

    assert_user_has_not_voted(voter, votes);
    assert_sender_zklogin(address_seed, ctx);
    assert_valid_project_ids(project_ids, votes);
    assert_voting_is_active(votes);

    // Update project's vote
    let mut curr_index = 0;
    while (curr_index < project_ids.length()) {
      let project = &mut votes.project_list[project_ids[curr_index]];
      project.votes = project.votes + 1;

      // Increment total votes
      votes.total_votes = votes.total_votes + 1;

      curr_index = curr_index + 1;
    };

    // Record user's vote
    table::add(
      &mut votes.votes, 
      voter, 
      project_ids
    );
  }

  public entry fun toggle_voting(_: &AdminCap, can_vote: bool, votes: &mut Votes) {
    votes.voting_active = can_vote;
  }

  fun assert_user_has_not_voted(user: address, votes: &Votes) {
    assert!(
      table::contains(
        &votes.votes, 
        user
      ) == false, 
      EUserAlreadyVoted
    );
  }

  fun assert_valid_project_ids(project_ids: vector<u64>, votes: &Votes) {
    assert!(
      project_ids.length() <= 3, 
      ETooManyVotes
    );
    
    let mut curr_index = 0;
    let mut ids = vec_map::empty();
    while (curr_index < project_ids.length()) {
      assert!(
        project_ids[curr_index] < votes.project_list.length(),
        EInvalidProjectId
      );
      vec_map::insert(&mut ids, project_ids[curr_index], 0); // this will abort if there is a dup
      curr_index = curr_index + 1;
    };
  }

  fun assert_voting_is_active(votes: &Votes) {
    assert!(
      votes.voting_active, 
      EVotingInactive
    );
  }

  fun assert_sender_zklogin(address_seed: u256, ctx: &TxContext) {
    let sender = ctx.sender();
    let issuer = string::utf8(b"https://accounts.google.com");
    assert!(check_zklogin_issuer(sender, address_seed, &issuer), EInvalidProof);
  }
}
