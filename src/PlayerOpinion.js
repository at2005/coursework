
class PlayerOpinion {
    constructor(pid) {
        this.player_id = pid;
        this.score = 1;
        this.account_alliance_op = this.account_alliance_op.bind(this);
        this.account_betrayal_op = this.account_betrayal_op.bind(this);
        this.account_support_given_op = this.account_support_given_op.bind(this);
        

    }

    account_betrayal_op() {
        // 1/3 the likelihood of supporting player after betrayal
        this.score /= 3;
    }

    account_alliance_op() {
        this.score *= 2;
    }

    account_support_given_op() {
        this.score *= 2;
    }
}


export default PlayerOpinion;