
/// Module: voting
module voting::voting {
  use std::string;
  use sui::table;
  use sui::vec_map;


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
    description: string::String, 
    /* 
    logo: ...,
    video: ..., 
    air_table_id: ...,
    ...
    */
    votes: u64
  }

  public struct VoterCap has key, store {
    id: UID
  }

  fun init(ctx: &mut TxContext) {
    let votes = Votes {
      id: object::new(ctx),
      total_votes: 0, 
      project_list: vector[],
      votes: table::new(ctx),
      voting_active: false
    };

    transfer::share_object(votes);

    transfer::transfer(
      VoterCap {
        id: object::new(ctx), 
      }, 
      ctx.sender()
    )
  }

  public fun vote(_: &VoterCap, /*track_id: u64,*/ project_ids: vector<u64>, voter: address, votes: &mut Votes) {
    assert_user_has_not_voted(voter, votes);
    assert_valid_project_ids(project_ids, votes);
    assert_voting_is_active(votes);

    // Increment total votes
    votes.total_votes = votes.total_votes + project_ids.length();

    // Update project's vote
    let mut curr_index = 0;
    while (curr_index < project_ids.length()) {
      let project = &mut votes.project_list[curr_index];
      project.votes = project.votes + 1;
      curr_index = curr_index + 1;
    };

    // Record user's vote
    table::add(
      &mut votes.votes, 
      voter, 
      project_ids
    );
  }

  public fun toggle_voting(_: &VoterCap, can_vote: bool, votes: &mut Votes) {
    votes.voting_active = can_vote;
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

  fun assert_valid_project_ids(project_ids: vector<u64>, votes: &Votes) {
    assert!(
      project_ids.length() <= 3, 
      0
    );
    
    let mut curr_index = 0;
    let mut ids = vec_map::empty();
    while (curr_index < project_ids.length()) {
      assert!(
        project_ids[curr_index] < votes.project_list.length(),
        0
      );
      vec_map::insert(&mut ids, project_ids[curr_index], 0); // this will abort if there is a dup
      curr_index = curr_index + 1;
    };
  }

  fun assert_voting_is_active(votes: &Votes) {
    assert!(
      votes.voting_active, 
      0
    );
  }
}
