import { useState } from 'react'

const PRICES = {
  adult: 299,
  child: 89,
  refill: 29,
  water: 10,
  soda: 25,
}

const DISCOUNTS = {
  none: 0,
  ten: 0.1,
  fifteen: 0.15,
  twenty: 0.2,
}

const INITIAL_FORM = {
  adult: '',
  child: '',
  drink: 'refill',
  water: '',
  soda: '',
  discount: 'none',
}

function numberOrZero(value) {
  return value === '' ? 0 : Number(value)
}

function calculateTotal(form) {
  const adult = numberOrZero(form.adult)
  const child = numberOrZero(form.child)
  const water = numberOrZero(form.water)
  const soda = numberOrZero(form.soda)
  const guests = adult + child
  const food = adult * PRICES.adult + child * PRICES.child
  const discount = food * DISCOUNTS[form.discount]
  const drinks = form.drink === 'refill'
    ? guests * PRICES.refill
    : water * PRICES.water + soda * PRICES.soda

  return { food, discount, drinks, total: food - discount + drinks }
}

function formatBaht(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleDrinkChange = (event) => {
    const drink = event.target.value
    setForm((current) => ({ ...current, drink, ...(drink === 'refill' ? { water: '', soda: '' } : {}) }))
    setError('')
  }

  const validate = () => {
    const fields = [
      ['จำนวนผู้ใหญ่', form.adult],
      ['จำนวนเด็ก', form.child],
      ...(form.drink === 'bottle'
        ? [['จำนวนน้ำเปล่า', form.water], ['จำนวนน้ำอัดลม', form.soda]]
        : []),
    ]

    for (const [label, value] of fields) {
      const number = numberOrZero(value)
      if (!Number.isInteger(number) || number < 0) {
        return `${label} ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`
      }
    }
    return ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }
    setError('')
    setResult(calculateTotal(form))
  }

  const reset = () => {
    setForm(INITIAL_FORM)
    setError('')
    setResult(null)
  }

  const isBottle = form.drink === 'bottle'
  const displayedTotal = result?.total ?? 0

  return (
    <main className="page-shell">
      <section className="calculator-card" aria-labelledby="page-title">
        <header className="hero">
          <p className="eyebrow">บุฟเฟต์ปิ้งย่าง</p>
          <h1 id="page-title">Buffet Calculator</h1>
          <p className="subtitle">คำนวณค่าอาหารบุฟเฟต์</p>
          <div className="brand-mark" aria-hidden="true">
            <span>♨</span>
            <strong>GRILL TIME</strong>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="people-grid">
            <label className="field">
              <span>จำนวนผู้ใหญ่ <small>(คนละ 299 บาท)</small></span>
              <input name="adult" type="number" min="0" step="1" inputMode="numeric" value={form.adult} onChange={updateField} placeholder="0" />
            </label>
            <label className="field">
              <span>จำนวนเด็ก <small>(คนละ 89 บาท)</small></span>
              <input name="child" type="number" min="0" step="1" inputMode="numeric" value={form.child} onChange={updateField} placeholder="0" />
            </label>
          </div>

          <fieldset className="drink-box">
            <legend>เครื่องดื่ม</legend>
            <label className="radio-option">
              <input type="radio" name="drink" value="refill" checked={form.drink === 'refill'} onChange={handleDrinkChange} />
              <span>น้ำรีฟิล <small>คนละ 29 บาท (ผู้ใหญ่และเด็ก)</small></span>
            </label>
            <label className="radio-option">
              <input type="radio" name="drink" value="bottle" checked={isBottle} onChange={handleDrinkChange} />
              <span>เครื่องดื่มแบบขวด</span>
            </label>
            <div className="bottle-grid" aria-disabled={!isBottle}>
              <label className="field">
                <span>น้ำเปล่า <small>(ขวดละ 10 บาท)</small></span>
                <input name="water" type="number" min="0" step="1" inputMode="numeric" value={form.water} onChange={updateField} disabled={!isBottle} placeholder="0" />
              </label>
              <label className="field">
                <span>น้ำอัดลม <small>(ขวดละ 25 บาท)</small></span>
                <input name="soda" type="number" min="0" step="1" inputMode="numeric" value={form.soda} onChange={updateField} disabled={!isBottle} placeholder="0" />
              </label>
            </div>
          </fieldset>

          <label className="field discount-field">
            <span>บัตรส่วนลด</span>
            <select name="discount" value={form.discount} onChange={updateField}>
              <option value="none">ไม่มีส่วนลด</option>
              <option value="ten">ส่วนลด 10%</option>
              <option value="fifteen">ส่วนลด 15%</option>
              <option value="twenty">ส่วนลด 20%</option>
            </select>
            <small className="hint">ลดเฉพาะค่าอาหารทั้งหมด ไม่รวมเครื่องดื่ม</small>
          </label>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="actions">
            <button className="calculate-button" type="submit">คำนวณ</button>
            <button className="reset-button" type="button" onClick={reset}>รีเซ็ต</button>
          </div>
        </form>

        <output className="total-panel" aria-live="polite">
          <span>ยอดชำระทั้งหมด</span>
          <strong>{formatBaht(displayedTotal)}</strong>
          <span>บาท</span>
          {result && (
            <small>ค่าอาหาร {formatBaht(result.food)} − ส่วนลด {formatBaht(result.discount)} + เครื่องดื่ม {formatBaht(result.drinks)}</small>
          )}
        </output>
      </section>
    </main>
  )
}
