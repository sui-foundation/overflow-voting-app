
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

  public struct VoterCap has key, store {
    id: UID
  }

  fun init(ctx: &mut TxContext) {
    let votes = Votes {
      id: object::new(ctx),
      total_votes: 0, 
      project_list: vector[],
      votes: table::new(ctx)
    };

    transfer::share_object(votes);

    transfer::transfer(
      VoterCap {
        id: object::new(ctx), 
      }, 
      ctx.sender()
    )
  }

  public fun vote(_: &VoterCap, /*track_id: u64,*/ project_id: u64, voter: address, votes: &mut Votes, ctx: &mut TxContext) {
    assert_user_has_not_voted(voter, votes);

    
  }

  fun assert_user_has_not_voted(user: address, votes: &Votes) {
    assert!(
      table::contains(
        &votes.votes, 
        user
      ) == false, 
      0
    );
  }
}
