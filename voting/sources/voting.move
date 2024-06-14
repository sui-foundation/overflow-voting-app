
/// Module: voting
module voting::voting {

  use std::string;
  use sui::table;

  const EStartTimestamp: u64 = 0;
  const EEndTimestamp: u64 = 0;


  public struct Votes has key {
    id: UID, 
    total_votes: u64, 
    project_list: vector<string::String>,
    votes: table::Table<address, u64>
  }

  fun init(ctx: &mut TxContext) {
    let votes = Votes {
      id: object::new(ctx),
      total_votes: 0, 
      project_list: vector[],
      votes: table::new(ctx)
    };

    transfer::share_object(votes);
  }

  public fun vote(project_id: u64, voter: address, votes: &mut Votes, ctx: &mut TxContext) {
    
  }
}
