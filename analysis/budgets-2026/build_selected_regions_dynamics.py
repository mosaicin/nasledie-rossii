"""Build budget-dynamics charts for six Russian regions.

Facts for selected key years come from Rosstat's regional compendia. The 2026
figures are budget plans and are deliberately not joined to factual series.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import requests


OUT = Path("/home/ubuntu/analysis-chechnya")
URL = "https://statbase.ru/include/confcountrynew/get_graph_country.php"

REGIONS = {
    "Moscow": {
        "label": "Москва",
        "statbase_id": "505093",
        "statbase_name": "г. Москва",
        "facts_mln": {
            2005: 503_760,
            2010: 1_107_594,
            2015: 1_529_127,
            2019: 2_694_799,
            2020: 3_016_605,
            2021: 3_458_709,
            2022: 3_616_553,
            2023: 4_418_017,
            2024: 5_213_417,
        },
        "plan_2026_bn": 6_385.0,
    },
    "Moscow Oblast": {
        "label": "Московская область",
        "statbase_id": "505094",
        "statbase_name": "Московская область",
        "facts_mln": {
            2005: 140_923,
            2010: 312_928,
            2015: 532_239,
            2019: 813_727,
            2020: 893_302,
            2021: 906_496,
            2022: 1_134_246,
            2023: 1_237_650,
            2024: 1_364_659,
        },
        "plan_2026_bn": 1_384.7,
    },
    "Stavropol Krai": {
        "label": "Ставропольский край",
        "statbase_id": "505133",
        "statbase_name": "Ставропольский край",
        "facts_mln": {
            2005: 29_289,
            2010: 72_444,
            2015: 103_517,
            2019: 138_735,
            2020: 161_839,
            2021: 171_309,
            2022: 196_469,
            2023: 216_233,
            2024: 243_605,
        },
        "plan_2026_bn": 221.6,
    },
    "Oryol Oblast": {
        "label": "Орловская область",
        "statbase_id": "505102",
        "statbase_name": "Орловская область",
        "facts_mln": {
            2005: 9_783,
            2010: 22_976,
            2015: 34_763,
            2019: 41_478,
            2020: 50_412,
            2021: 52_224,
            2022: 61_155,
            2023: 67_927,
            2024: 67_960,
        },
        "plan_2026_bn": 61.0,
    },
    "Tula Oblast": {
        "label": "Тульская область",
        "statbase_id": "505137",
        "statbase_name": "Тульская область",
        "facts_mln": {
            2005: 20_496,
            2010: 51_694,
            2015: 76_212,
            2019: 102_234,
            2020: 114_954,
            2021: 126_680,
            2022: 146_104,
            2023: 153_495,
            2024: 182_251,
        },
        "plan_2026_bn": 169.6,
    },
    "Chechnya": {
        "label": "Чеченская Республика",
        "statbase_id": "505144",
        "statbase_name": "Чеченская Республика",
        "facts_mln": {
            2005: 15_357,
            2010: 65_720,
            2015: 74_420,
            2019: 97_846,
            2020: 128_239,
            2021: 140_213,
            2022: 155_934,
            2023: 166_113,
            2024: 160_799,
        },
        "plan_2026_bn": 155.4,
    },
}

BASE = REGIONS["Chechnya"]
COLORS = {
    "Moscow": "#264653",
    "Moscow Oblast": "#2a9d8f",
    "Stavropol Krai": "#e9c46a",
    "Oryol Oblast": "#f4a261",
    "Tula Oblast": "#6d597a",
    "Chechnya": "#b64a32",
}


def fetch_annual_with_funds(region_key: str) -> pd.DataFrame:
    """Download the 2014–2024 annual series from the public graph response."""
    region = REGIONS[region_key]
    response = requests.post(
        URL,
        data={
            "indicator": "507445",
            "country": BASE["statbase_id"],
            "sravcountry": region["statbase_id"],
            "couname": BASE["statbase_name"],
            "sravcouname": region["statbase_name"],
            "frmreq": "0",
            "sproc": "sum",
            "year": "2024",
            "prod": "0",
        },
        timeout=30,
    )
    response.raise_for_status()
    match = re.search(r"var data = (\[.*?\]);", response.text, flags=re.S)
    if not match:
        raise ValueError(f"Could not parse public chart response for {region_key}")
    raw = re.sub(r",\s*\]", "]", match.group(1))
    data = json.loads(raw)
    value_key = "1" if region_key == "Chechnya" else "2"
    return pd.DataFrame(
        {
            "year": [int(row["year"]) for row in data],
            "region": region["label"],
            "expenses_rub": [int(row[value_key]) for row in data],
            "measure": "исполненные расходы консолидированного бюджета с ТГВБФ",
            "source": "Казначейство России через Statbase",
        }
    )


def build_factual_key_years() -> pd.DataFrame:
    rows = []
    for key, meta in REGIONS.items():
        for year, expenses_mln in meta["facts_mln"].items():
            rows.append(
                {
                    "region_key": key,
                    "region": meta["label"],
                    "year": year,
                    "expenses_bn_rub": expenses_mln / 1000,
                    "status": "факт",
                    "measure": "расходы консолидированного бюджета субъекта",
                    "source": "Росстат: Регионы России, 2023/2025",
                }
            )
        rows.append(
            {
                "region_key": key,
                "region": meta["label"],
                "year": 2026,
                "expenses_bn_rub": meta["plan_2026_bn"],
                "status": "план",
                "measure": "расходы бюджета субъекта",
                "source": "сводка бюджетов регионов 2026; законы о региональных бюджетах",
            }
        )
    return pd.DataFrame(rows)


def plot_key_years(facts: pd.DataFrame) -> None:
    factual = facts.query("status == 'факт'")
    plans = facts.query("status == 'план'")
    fig, (ax_abs, ax_index) = plt.subplots(1, 2, figsize=(17, 7), constrained_layout=True)
    for key, meta in REGIONS.items():
        fact = factual.query("region_key == @key").sort_values("year")
        color = COLORS[key]
        ax_abs.plot(fact.year, fact.expenses_bn_rub, marker="o", lw=2.2, color=color, label=meta["label"])
        plan = plans.query("region_key == @key").iloc[0]
        ax_abs.scatter([2026], [plan.expenses_bn_rub], marker="^", facecolors="white", edgecolors=color, s=85, linewidths=2.0, zorder=5)
        base = fact.loc[fact.year == 2005, "expenses_bn_rub"].iloc[0]
        ax_index.plot(fact.year, fact.expenses_bn_rub / base * 100, marker="o", lw=2.2, color=color, label=meta["label"])
        ax_index.scatter([2026], [plan.expenses_bn_rub / base * 100], marker="^", facecolors="white", edgecolors=color, s=85, linewidths=2.0, zorder=5)
    ax_abs.set_yscale("log")
    ax_abs.set_title("Расходы консолидированных бюджетов\n(факт; номинально, логарифмическая шкала)")
    ax_abs.set_ylabel("млрд руб.")
    ax_abs.set_xlabel("год")
    ax_abs.grid(True, alpha=0.25, which="both")
    ax_index.set_title("Рост к 2005 году\n(факт; 2005 = 100)")
    ax_index.set_ylabel("индекс, 2005 = 100")
    ax_index.set_xlabel("год")
    ax_index.grid(True, alpha=0.25)
    ax_index.axhline(100, color="#777", lw=0.8)
    for ax in (ax_abs, ax_index):
        ax.set_xticks([2005, 2010, 2015, 2019, 2020, 2021, 2022, 2023, 2024, 2026])
        ax.tick_params(axis="x", rotation=35)
    handles, labels = ax_abs.get_legend_handles_labels()
    fig.legend(handles, labels, loc="lower center", ncol=3, frameon=False, bbox_to_anchor=(0.5, -0.06))
    fig.suptitle("Динамика расходов шести регионов: 2005–2026", fontsize=16, fontweight="bold")
    fig.text(
        0.5,
        -0.13,
        "Круги — исполненные расходы консолидированных бюджетов субъектов; треугольники — планы бюджетов субъектов на 2026 год,\n"
        "которые показаны отдельно и не соединены линией, поскольку их бюджетный охват иной.",
        ha="center",
        fontsize=9,
        color="#444",
    )
    fig.savefig(OUT / "selected_regions_budget_dynamics_2005_2026.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def plot_annual_series(annual: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(12, 7), constrained_layout=True)
    for key, meta in REGIONS.items():
        data = annual.query("region == @meta['label']").sort_values("year")
        ax.plot(data.year, data.expenses_rub / 1e9, marker="o", lw=2.2, color=COLORS[key], label=meta["label"])
    ax.set_yscale("log")
    ax.set_title("Ежегодная динамика исполненных расходов, 2014–2024\n(единая база Казначейства; включает ТГВБФ)", fontsize=15, fontweight="bold")
    ax.set_xlabel("год")
    ax.set_ylabel("млрд руб., логарифмическая шкала")
    ax.grid(True, alpha=0.25, which="both")
    ax.set_xticks(list(range(2014, 2025)))
    ax.legend(ncol=2, frameon=False)
    fig.savefig(OUT / "selected_regions_annual_dynamics_2014_2024.png", dpi=220)
    plt.close(fig)


def main() -> None:
    key_years = build_factual_key_years()
    key_years.to_csv(OUT / "selected_regions_budget_dynamics_2005_2026.csv", index=False)
    annual = pd.concat([fetch_annual_with_funds(key) for key in REGIONS], ignore_index=True)
    annual.to_csv(OUT / "selected_regions_annual_dynamics_2014_2024.csv", index=False)
    plot_key_years(key_years)
    plot_annual_series(annual)
    print(key_years.to_string(index=False))
    print("Created:", OUT / "selected_regions_budget_dynamics_2005_2026.png")
    print("Created:", OUT / "selected_regions_annual_dynamics_2014_2024.png")


if __name__ == "__main__":
    main()
