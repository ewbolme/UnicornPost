import './bottomBar.css'
import Logo from '../../static/images/xenonstack-website-new-logo (2) 1.svg'

export default function BottomBar () {
    return (
        <div className='bottom-bar'>
            <div style={{ height: '1rem' }}>
                <img src={Logo} className="unicorn-img" alt="unicorn"/>
            </div>
        </div>
    )
}