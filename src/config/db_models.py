from db import db

class Claims(db.Model):
    __tablename__ = 'vw_claims'

    clm_hdr_id = db.Column(db.Integer, primary_key=True)
    last_upd_dt = db.Column(db.Date, nullable=False)
    curnt_entry = db.Column(db.Integer, nullable=False)
    stat_id = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Claim {self.clm_hdr_id}>'
