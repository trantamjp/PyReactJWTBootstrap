from .address import Address
from .base_model import BaseModel, db
from .city import City
from .country import Country

search_like_escape = BaseModel.search_like_escape


class Customer(BaseModel):
    __tablename__ = 'customer'

    customer_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('customer_customer_id_seq'::regclass)"))
    store_id = db.Column(db.SmallInteger, nullable=False, index=True)
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False, index=True)
    email = db.Column(db.String(50))
    address_id = db.Column(db.ForeignKey('address.address_id', ondelete='RESTRICT',
                                         onupdate='CASCADE'), nullable=False, index=True)
    activebool = db.Column(db.Boolean, nullable=False,
                           server_default=db.text("true"))
    create_date = db.Column(db.Date, nullable=False,
                            server_default=db.text("('now'::db.text)::date"))
    last_update = db.Column(db.DateTime, server_default=db.text("now()"))
    active = db.Column(db.Integer)

    address = db.relationship('Address', backref='customers')

    def __repr__(self):
        return '<Customer {} {} {} -> address_id {}>'.format(self.customer_id, self.first_name, self.last_name, self.address_id)

    @classmethod
    def datatable_search(cls, args):

        offset = args.get('offset') or 0
        limit = args.get('limit') or 10
        filters = args.get('filters') or {}
        orders = args.get('orders') or []

        records_total = Customer.query.count()

        rs_filters = []
        for filter in filters:
            filter_id = filter.get('id')

            search_value = filter.get('value') or ''
            if search_value == '':
                continue

            if filter_id == 'first_name':
                rs_filters.append(Customer.first_name.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'last_name':
                rs_filters.append(Customer.last_name.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'activebool':
                rs_filters.append(Customer.activebool.is_(
                    str(search_value) == '1'))
                continue

            if filter_id == 'address.address':
                search_value_like = search_like_escape(search_value)
                rs_filters.append(db.or_(
                    Address.address.ilike(search_value_like),
                    Address.address2.ilike(search_value_like)
                ))
                continue

            if filter_id == 'address.postal_code':
                rs_filters.append(Address.postal_code.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'address.phone':
                rs_filters.append(Address.phone.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'address.city.city':
                rs_filters.append(City.city.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'address.city.country.country':
                rs_filters.append(Country.country.ilike(
                    search_like_escape(search_value)))
                continue

        rs_filtered = Customer.query.join(Address).join(
            City).join(Country).filter(db.and_(*rs_filters))

        # Count without limit
        records_filtered = rs_filtered.with_entities(
            db.func.count(db.distinct(Customer.customer_id))).scalar()

        order_columns = []
        for order in orders:
            order_id = order.get('id')
            order_desc = order.get('desc')

            if order_id == 'first_name':
                order_columns.append([Customer.first_name, order_desc])
                continue

            if order_id == 'last_name':
                order_columns.append([Customer.last_name, order_desc])
                continue

            if order_id == 'activebool':
                order_columns.append([Customer.activebool, order_desc])
                continue

            if order_id == 'address.address':
                order_columns.append([Address.address, order_desc])
                order_columns.append([Address.address2, order_desc])
                continue

            if order_id == 'address.postal_code':
                order_columns.append([Address.postal_code, order_desc])
                continue

            if order_id == 'address.phone':
                order_columns.append([Address.phone, order_desc])
                continue

            if order_id == 'address.city.city':
                order_columns.append([City.city, order_desc])
                continue

            if order_id == 'address.city.country.country':
                order_columns.append([Country.country, order_desc])
                continue

        rs_orders = list(map(lambda order: order[0].desc() if order[1] else order[0].asc(),
                             order_columns))
        select_columns = list(map(lambda order: order[0], order_columns))

        # Only interested on customer_id AFTER order and limit
        filtered_with_limit_subq = rs_filtered \
            .with_entities(Customer.customer_id).order_by(*rs_orders) \
            .limit(limit).offset(offset).subquery()

        final_query = Customer.query \
            .join(filtered_with_limit_subq, Customer.customer_id == filtered_with_limit_subq.c.customer_id) \
            .join(Address).join(City).join(Country) \
            .options(db.contains_eager(Customer.address).contains_eager(Address.city).contains_eager(City.country)) \
            .order_by(*rs_orders)   # Apply order again for eager loading

        customers = final_query.all()

        customer_list = {
            'records_total': records_total,
            'records_filtered': records_filtered,
            'customers': customers,
        }

        return customer_list
